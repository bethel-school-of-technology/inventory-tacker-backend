var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

router.get('/', function(req, res, next) {
	models.mowers
		.findAll({
			where: { Deleted: false }
		})
		.then((results) => res.send(JSON.stringify(results)))
		//.then((results) => res.render('inventory', { inventory: results }))
		.catch((err) => res.send('Need to be logged in to view this page.'));
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
				res.send(JSON.stringify(created));
			} else {
				res.send(JSON.stringify('Input failed'));
			}
		});
});

router.get('/:id', function(req, res, next) {
	let MowerId = parseInt(req.params.id);
	if (MowerId) {
		models.mowers
			.findByPk(parseInt(req.params.id))
			.then((mowers) => {
				res.send(
					JSON.stringify({
						MowerId: mowers.MowerId,
						MowerName: mowers.MowerName,
						MowerType: mowers.MowerType,
						Inventory: mowers.Inventory
					})
				);
			})
			.catch((err) => res.send('please login'));
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
				Inventory: req.body.inventory
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
