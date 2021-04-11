var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;
const LS = require('./dist/userLocalStorage');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login');
});

module.exports = router;
