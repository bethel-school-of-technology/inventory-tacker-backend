var express = require('express');
var router = express.Router();
//var staticModels = require('../staticModels/mowers');
var mysql = require('mysql2');
var axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Money Mower Staff and Inventory Tracker' });
});

router.get('/staticMowers', function(req, res, next) {
	res.send(JSON.stringify(staticModels.mower));
});

/*axios.get('http://localhost:3000/Login').then((res) => {
		let loginArray = [];
		res.data.map((login) => {
			postArray.push(login);
		});
	});
	res.post('login', { login: loginArray });*/

module.exports = router;
