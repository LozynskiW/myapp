var express = require('express');
const { emit } = require('../app');
var router = express.Router();
var yahooStockPrices = require('yahoo-stock-prices');
var stockInfo;

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const pageSize = 10;
  let sort = parseInt(req.query.sort);
  sort = sort ? sort : 1;
  const count = await req.db.db('myapp')
      .collection('companies-data')
      .count({});
  const maxPage = Math.floor(count / pageSize);
  let page = parseInt(req.query.page);
  page = page >= 0 ? page : 0;
  page = page <= maxPage ? page : maxPage;
  const prevPage = page > 0 ? page - 1 : 0;
  const nextPage = page < maxPage ? page + 1 : maxPage;

  var companies = await req.db.db('myapp')
        .collection('companies-data')
        .find({})
        .sort(['shortcut', sort])
        .skip(page * pageSize)
        .limit(pageSize)
        .toArray();
  

  var userObservedComp = await req.db.db('myapp')
        .collection('user-data')
        .find({
          "login": req.query.userLogin
        })
        .toArray();
  
  var checkHottestStocks = await req.db.db('myapp')
        .collection('companies-data')
        .mapReduce(
          function(){
          emit(this.stockShort, [this.buy, this.sell])
        }, 
        function(key, values){
          return Array.sum(values);
        },{
          query: {},
          out: "num-of-recommendations-data"
        });

  var mostRecommendedBuy = await req.db.db('myapp')
    .collection("companies-data")
    .aggregate([
      {$group : {
          _id: {company : "$shortcut", recommendation: "$buy"},
          total: {$sum: '$buy'} } 
        },
      { $sort: {total: -1}}
      ])
      .toArray();
  
  var mostRecommendedSell = await req.db.db('myapp')
    .collection("companies-data")
    .aggregate([
      {$group : {
          _id: {company : "$shortcut", recommendation: "$sell"},
          total: {$sum: '$sell'} } 
        },
      { $sort: {total: -1}}
      ])
      .toArray();
  
  var hottestStocks = await req.db.db('myapp')
        .collection("companies-data")
        .aggregate([
          {$group : {
              _id: {company : "$shortcut"},
              total: {$sum: {$add : ['$buy','$sell']} } 
            }},
          { $sort: {total: -1}}
          ])
          .toArray();
  
  while (hottestStocks.length > 5){
    hottestStocks.pop();
  }

  while (mostRecommendedSell.length > 5){
    mostRecommendedSell.pop();
  }

  while (mostRecommendedBuy.length > 5){
    mostRecommendedBuy.pop();
  }

  res.render('users', 
  {
    sort: sort,
    page: page,
    prevPage: prevPage,
    nextPage: nextPage,
    count: count,
    companies: companies, 
    hottestStocks: hottestStocks, 
    recommendationsBuy: mostRecommendedBuy,
    recommendationsSell: mostRecommendedSell, 
    userLogin: req.query.userLogin, 
    companyPanel: stockInfo
  });
});

/* GET user */
router.get('/observe', async function (req, res, next) {
  try {
    let stockShort = req.query.stockShort;
    let userLogin = req.query.userLogin;
    await req.db.db('myapp')
            .collection('user-data')
            .findAndModify({
              query: {login: userLogin},
              update: { $addFields: { observed: { $concatArrays: [ "$observed", [ stockShort ] ] } } }
            });
    res.redirect('users/?userLogin='+userLogin);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
