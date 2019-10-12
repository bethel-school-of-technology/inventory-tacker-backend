var express = require('express');
var router = express.Router();
//var staticModels = require('../staticModels/mowers');
var mysql = require('mysql2');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Money Mower Staff and Inventory Pages' });
});

/*router.get('/staticMowers', function(req, res, next) {
	res.send(JSON.stringify(staticModels.mower));
});*/

module.exports = router;
