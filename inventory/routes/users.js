var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');
var axios = require('axios');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

/*
//This get's back all the tasks
router.get('/', async (req, res) => {
	try {
		const requests = await Request.find();
		res.json(requests);
	} catch (err) {
		res.json({ message: err });
	}
});

//Submits all the tasks

router.post('/', async (req, res) => {
	const request = await new Request({
		UserId: req.body.UserId,
		token: req.cookies.jwt
	});
	return request
		.save()
		.then((result) => {
			console.log(result);
			res.status(201).json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(422).json({
				error: err
			});
		});
});


*/

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
				Username: req.body.Username
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
				res.json({
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
					.then((usersFound) => res.json({ users: usersFound }));
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

router.post('/admin/editUser/:id/update', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user) {
				let UserId = parseInt(req.params.id);
				models.users
					.update(
						{
							UserId: users.UserId,
							FirstName: users.FirstName,
							LastName: users.LastName,
							EmployeeNumber: users.EmployeeNumber,
							Email: users.Email,
							Username: users.Username,
							Admin: users.Admin
						},
						{
							where: { UserId: UserId }
						}
					)
					.then((result) => res.json(result))
					.catch((err) => {
						res.status(400);
						res.send(
							'There was a problem updating the employee information. Please make sure you are specifying the correct id.'
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
						res.json({
							UserId: users.UserId,
							FirstName: users.FirstName,
							LastName: users.LastName,
							EmployeeNumber: users.EmployeeNumber,
							Email: users.Email,
							Username: users.Username,
							Admin: users.Admin
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
