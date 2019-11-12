var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Money Mower Staff and Inventory Tracker' });
});
module.exports = router;
