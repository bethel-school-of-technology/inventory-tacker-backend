// module.exports = router;
var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');
const jwt = require('jsonwebtoken');
var axios = require('axios');

//Verify Token
function verifyToken(req, res, next) {
	const bearerHeader = req.headers['authorization'];
	if (typeof bearerHeader !== 'undefined') {
		const bearer = bearerHeader.split(' ');
		const bearerToken = bearer[1];
		req.token = bearerToken;
		next();
		console.log(token);
	} else {
		res.send('Forbidden');
	}
}

router.get('/', function(req, res, next) {
	res.send(JSON.stringify('respond with a resource'));
});

router.get('/signup', function(req, res, next) {
	res.render('signup');
});

router.post('/signup', function(req, res, next) {
	models.users
		.findOrCreate({
			where: {
				Username: req.body.Username
			},
			defaults: {
				FirstName: req.body.FirstName,
				LastName: req.body.LastName,
				EmployeeNumber: req.body.EmployeeNumber,
				Email: req.body.Email,
				Password: authService.hashPassword(req.body.Password)
			}
		})
		.spread(function(result, created) {
			if (created) {
				res.send(JSON.stringify('User successfully created'));
			} else {
				res.send(JSON.stringify('This user already exists'));
			}
		});
});

router.get('/login', function(req, res, next) {
	res.render('login');
});

router.post('/login', function(req, res, next) {
	models.users
		.findOne({
			where: {
				Username: req.body.Username
			}
		})
		.then((user) => {
			if (!user) {
				console.log('User not found');
				return res.status(401).send(JSON.stringify('Login Failed'));
			} else {
				let passwordMatch = authService.comparePasswords(req.body.Password, user.Password);

				if (passwordMatch) {
					let token = authService.signUser(user);
					res.cookie('jwt', token);
					res.send(token);
				} else {
					res.status(401);
					res.send(JSON.stringify('Wrong password. Please go back and try again.'));
				}
			}
		});
});

// router.get('/admin', function(req, res, next) {
// 	models.users
// 		.findAll({
// 			where: {
// 				Deleted: false
// 			},
// 			raw: true
// 		})
// 		.then((usersFound) => res.send(JSON.stringify(usersFound)))
// 		.catch((err) => res.send('You are not authorized to access this page'));
// });

router.get('/admin', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user.Admin) {
				models.users
					.findAll({
						where: { Deleted: false },
						raw: true
					})
					.then((usersFound) => res.send(JSON.stringify(usersFound)));
			} else {
				res.status(401);
				res.send(JSON.stringify('You are not authorized to access this page'));
			}
		});
	} else {
		res.send(JSON.stringify('Need to be logged in as an Administator to view this page.'));
	}
});

router.get('/admin/editUser/:id', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user.Admin) {
				models.users
					.findAll({
						where: { UserId: UserId },
						raw: true
					})
					.then((usersFound) => res.send(JSON.stringify(usersFound)));
			} else {
				res.status(401);
				res.send(JSON.stringify('You are not authorized to access this page'));
			}
		});
	} else {
		res.send(JSON.stringify('Need to be logged in as an Administator to view this page.'));
	}
});
// 	let token = req.cookies.jwt;
// 	if (token) {
// 		authService.verifyUser(token).then((user) => {
// 			if (user.Admin) {
// 				let UserId = parseInt(req.params.id);
// 				if (UserId) {
// 					models.users.findByPk(parseInt(req.params.id)).then((users) => {
// 						res.send(
// 							JSON.stringify({
// 								UserId: users.UserId,
// 								FirstName: users.FirstName,
// 								LastName: users.LastName,
// 								EmployeeNumber: users.EmployeeNumber,
// 								Email: users.Email,
// 								Username: users.Username,
// 								Admin: users.Admin
// 							})
// 						);
// 					});
// 				}
// 			} else {
// 				res.send(JSON.stringify('Not authorized to view'));
// 			}
// 		});
// 	} else {
// 		res.send(JSON.stringify('Admin privileges required'));
// 	}
// });

router.post('/admin/editUser/:id/delete', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user) {
				let UserId = parseInt(req.params.id);
				models.users
					.update(
						{
							Deleted: true
						},
						{
							where: { Userid: UserId }
						}
					)
					.then((result) => res.send(JSON.stringify(result)))
					.catch((err) => {
						res.status(400);
						res.send(
							JSON.stringify(
								'There was a problem deleting the user. Please make sure you are specifying the correct id.'
							)
						);
					});
			}
		});
	}
});

router.get('/logout', function(req, res, next) {
	res.cookie(JSON.stringify('jwt', '', { expires: new Date(0) }));
});

module.exports = router;
