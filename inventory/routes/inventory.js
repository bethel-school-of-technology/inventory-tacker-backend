var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');
const jwt = require('jsonwebtoken');

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
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user) {
				models.mowers
					.findAll({
						where: { Deleted: false }
					})
					.then((results) => res.send(JSON.stringify(results)));
			} else {
				res.status(401);
				res.send(JSON.stringify('You are not authorized to view this page'));
			}
		});
	} else {
		models.mowers
			.findAll({
				where: { Deleted: false }
			})
			.then((results) => res.send(JSON.stringify(results)));
		//res.send(JSON.stringify('Need to be logged in to view this page.'));
	}
});

router.post('/', function(req, res, next) {
	models.mowers
		.findOrCreate({
			where: {
				MowerName: req.body.MowerName,
				MowerType: req.body.MowerType,
				Inventory: req.body.Inventory
			}
		})
		.spread(function(result, created) {
			if (created) {
				res.send(JSON.stringify(created));
			} else {
				res.send(JSON.stringify('Input failed'));
			}
		});
});

router.get('/:id', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user) {
				let MowerId = parseInt(req.params.id);
				if (MowerId) {
					models.mowers.findByPk(parseInt(req.params.id)).then((mowers) => {
						res.send(
							JSON.stringify({
								MowerId: mowers.MowerId,
								MowerName: mowers.MowerName,
								MowerType: mowers.MowerType,
								Inventory: mowers.Inventory
							})
						);
					});
				}
			} else {
				res.send(JSON.stringify('please login'));
			}
		});
	} else {
		res.send(JSON.stringify('please login'));
	}
});

router.post('/:id/delete', function(req, res, next) {
	let mowerId = parseInt(req.params.id);
	models.mowers
		.update(
			{
				Deleted: true
			},
			{
				where: { MowerId: mowerId }
			}
		)
		.then((result) => res.json(result))
		.catch((err) => {
			res.status(400);
			res.send('There was a problem deleting the inventory. Please make sure you are specifying the correct id.');
		});
});

router.post('/:id/update', function(req, res, next) {
	let mowerId = parseInt(req.params.id);
	models.mowers
		.update(
			{
				Inventory: req.body.Inventory
			},
			{
				where: { MowerId: mowerId }
			}
		)
		.then((result) => res.json(result))
		.catch((err) => {
			res.status(400);
			res.send(
				'There was a problem updating the inventory list. Please make sure you are specifying the correct id.'
			);
		});
});

module.exports = router;
