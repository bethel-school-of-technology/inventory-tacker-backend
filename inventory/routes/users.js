var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');
var jwt = require('jsonwebtoken');
var axios = require('axios');

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
				Username: req.body.username,
				Password: req.body.password
			}
		})
		.then((user) => {
			res.setHeader('Content-Type', 'application/json');
			if (user) {
				res.send(JSON.stringify(user));
				//res.redirect('admin');
			} else {
				res.send('Invalid login!');
			}
		});
});

router.get('/admin', function(req, res, next) {
	models.users
		.findAll({
			where: {
				Deleted: false
			},
			raw: true
		})
		.then((usersFound) => res.send(JSON.stringify({ usersFound })))
		.catch((err) => res.send('You are not authorized to access this page'));
});

router.post('/admin/editUser/:id/delete', function(req, res, next) {
	let UserId = parseInt(req.params.id);

	models.users
		.update(
			{
				Deleted: true
			},
			{
				where: { UserId: UserId }
			}
		)
		.then((result) => res.send(JSON.stringify(result)))
		.catch((err) => {
			res.status(400);
			res.send('There was a problem deleting the user. Please make sure you are specifying the correct id.');
		});
});

router.get('/admin/editUser/:id', function(req, res, next) {
	let UserId = parseInt(req.params.id);
	if (UserId) {
		models.users.findByPk(parseInt(req.params.id)).then((users) => {
			res.send(
				JSON.stringify({
					UserId: users.UserId,
					FirstName: users.FirstName,
					LastName: users.LastName,
					EmployeeNumber: users.EmployeeNumber,
					Email: users.Email,
					Username: users.Username,
					Admin: users.Admin
				})
			);
		});
	} else {
		res.send('Not authorized to view');
	}
});

router.get('/logout', function(req, res, next) {
	res.cookie(JSON.stringify('jwt', '', { expires: new Date(0) }));
});

module.exports = router;
