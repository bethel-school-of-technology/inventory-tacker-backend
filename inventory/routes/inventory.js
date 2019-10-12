var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

router.get('/', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user) {
				models.mowers
					.findAll({
						where: { Deleted: false }
					})
					.then((results) => res.render('inventory', { inventory: results }));
			} else {
				res.status(401);
				res.send('You are not authorized to view this page');
			}
		});
	} else {
		res.send('Need to be logged in to view this page.');
	}
});

router.post('/', function(req, res, next) {
	models.mowers
		.findOrCreate({
			where: {
				MowerName: req.body.title,
				MowerType: req.body.body,
				Inventory: req.body.inventory
			}
		})
		.spread(function(result, created) {
			if (created) {
				res.render('inventory');
				res.redirect('/inventory');
			} else {
				res.send('Input failed');
			}
		});
});

router.get('/:id', function(req, res, next) {
	let token = req.cookies.jwt;
	if (token) {
		authService.verifyUser(token).then((user) => {
			if (user) {
				let UserId = parseInt(req.params.id);
				if (UserId) {
					models.mowers.findByPk(parseInt(req.params.id)).then((mowers) => {
						res.render('editInventory', {
							MowerId: mowers.MowerId,
							MowerName: mowers.MowerName,
							MowerType: mowers.MowerType,
							Inventory: mowers.Inventory
						});
					});
				}
			} else {
				res.send('Not authorized to update');
			}
		});
	} else {
		res.send('please login');
	}
});

router.delete('/:id/delete', function(req, res, next) {
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
		.then((result) => res.redirect('/inventory'))
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
				MowerName: req.body.title,
				MowerType: req.body.body,
				Inventory: req.body.inventory
			},
			{
				where: { MowerId: mowerId }
			}
		)
		.then((result) => res.redirect('/inventory'))
		.catch((err) => {
			res.status(400);
			res.send(
				'There was a problem updating the inventory list. Please make sure you are specifying the correct id.'
			);
		});
});

module.exports = router;
