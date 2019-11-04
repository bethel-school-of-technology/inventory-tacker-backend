var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Money Mower Staff and Inventory Tracker' });
});

module.exports = router;
