var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/signup', function(req, res, next) {
	res.render('signup');
});

router.post('/signup', function(req, res, next) {
	models.users
		.findOrCreate({
			where: {
				Username: req.body.username
			},
			defaults: {
				FirstName: req.body.firstName,
				LastName: req.body.lastName,
				EmployeeNumber: req.body.employeeNumber,
				Email: req.body.email,
				Password: authService.hashPassword(req.body.password)
			}
		})
		.spread(function(result, created) {
			if (created) {
				res.send('User successfully created');
			} else {
				res.send('This user already exists');
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
				Username: req.body.username
			}
		})
		.then((user) => {
			if (!user) {
				console.log('User not found');
				return res.status(401).json({
					message: 'Login Failed'
				});
			} else {
				let passwordMatch = authService.comparePasswords(req.body.password, user.Password);
				if (passwordMatch) {
					let token = authService.signUser(user);
					res.cookie('jwt', token);
					res.redirect('profile');
				} else {
					res.send('Wrong password. Please go back and try again.');
				}
			}
		});
});

router.get('/profile', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user) {
				res.render('profile', {
					FirstName: user.FirstName,
					LastName: user.LastName,
					EmployeeNumber: user.EmployeeNumber,
					Email: user.Email,
					Username: user.Username
				});
			} else {
				res.status(401);
				res.send('Invalid authentication token');
			}
		});
	} else {
		res.status(401);
		res.send('Must be logged in');
	}
});

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
					.then((usersFound) => res.render('adminView', { users: usersFound }));
			} else {
				res.status(401);
				res.send('You are not authorized to access this page');
			}
		});
	} else {
		res.send('Need to be logged in as an Administator to view this page.');
	}
});

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
					.then((result) => res.redirect('/users/admin'))
					.catch((err) => {
						res.status(400);
						res.send(
							'There was a problem deleting the user. Please make sure you are specifying the correct id.'
						);
					});
			}
		});
	}
});

router.get('/admin/editUser/:id', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user.Admin) {
				let UserId = parseInt(req.params.id);
				if (UserId) {
					models.users.findByPk(parseInt(req.params.id)).then((users) => {
						res.render('editUser', {
							UserId: users.UserId,
							FirstName: users.FirstName,
							LastName: users.LastName,
							EmployeeNumber: users.EmployeeNumber,
							Email: users.Email,
							Username: users.Username
						});
					});
				}
			} else {
				res.send('Not authorized to view');
			}
		});
	} else {
		res.send('Admin privileges required');
	}
});

router.get('/logout', function(req, res, next) {
	res.cookie('jwt', '', { expires: new Date(0) });
	res.redirect('login');
});

module.exports = router;
