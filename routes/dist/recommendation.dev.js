"use strict";

var express = require('express');

var router = express.Router();
router.get('/all', function _callee(req, res, next) {
  var recommendations;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(req.db.db('myapp').collection('recommendations-data').find({}).toArray());

        case 2:
          recommendations = _context.sent;
          res.render('users', {
            recommendations: recommendations
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/stockInfo', function _callee2(req, res, next) {
  var stockInfo;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(req.db.db('myapp').collection('companies-data').find({
            "shortcut": req.query.stockShort
          }).toArray());

        case 2:
          stockInfo = _context2.sent;
          res.redirect('users/?userLogin=' + req.body.userLogin);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.post('/', function _callee3(req, res, next) {
  var existingRecommendation, newRecommendation, insertNewRecommendation;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(req.db.db('myapp').collection('recommendation-data').find({
            "user": req.body.userLogin,
            "stockShort": req.body.stockShort,
            "recommendation": req.body.recommendation
          }).toArray());

        case 2:
          existingRecommendation = _context3.sent;

          if (!(typeof existingRecommendation !== 'undefined' && existingRecommendation.length > 0)) {
            _context3.next = 8;
            break;
          }

          _context3.next = 6;
          return regeneratorRuntime.awrap(req.db.db('myapp').collection('recommendation-data').findOneAndUpdate({
            "user": req.body.userLogin,
            "stockShort": req.body.stockShort,
            "recommendation": req.body.recommendation
          }, {
            $set: {
              "recommendation": req.body.recommendation
            }
          }));

        case 6:
          _context3.next = 12;
          break;

        case 8:
          newRecommendation = {
            user: req.body.userLogin,
            stockShort: req.body.stockShort,
            recommendation: req.body.recommendation,
            date: JSON.stringify(Date.now())
          };
          _context3.next = 11;
          return regeneratorRuntime.awrap(req.db.db('myapp').collection('recommendation-data').insertOne(newRecommendation));

        case 11:
          insertNewRecommendation = _context3.sent;

        case 12:
          res.redirect('users/?userLogin=' + req.body.userLogin);

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  });
});
module.exports = router;