var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;
var yahooStockPrices = require('yahoo-stock-prices');

router.post('/', async function(req, res, next) {
  console.log(req.body.frequency);
  console.log(req.body.startDate);
  var startDate = new Date(req.body.startDate);
  console.log(startDate.getDate());
});

router.get('/', async function(req, res, next) {
  var stockInfo = await req.db.db('myapp')
    .collection('companies-data')
    .find({
        "shortcut":req.query.stockShort
    })
    .toArray();
    
  var today = new Date();
  var startDate;
  var endDate;

  var startDateDay;
  var startDateMonth;
  var startDateYear;
  
  var endDateDay;
  var endDateMonth;
  var endDateYear;

  if (req.query.startDate === undefined || req.query.startDate === NaN) {
    startDateDay = today.getDate();
    startDateMonth = today.getMonth();
    startDateYear = today.getFullYear()-1;
  } else {
    startDate = new Date(req.query.startDate);
    startDateDay = startDate.getDate();
    startDateMonth = startDate.getMonth();
    startDateYear = startDate.getFullYear();
  }

  if (req.query.endDate === undefined || req.query.endDate === NaN) {
    endDateDay = today.getDate();
    endDateMonth = today.getMonth();
    endDateYear = today.getFullYear();
  } else {
    endDate = new Date(req.query.endDate);
    endDateDay = endDate.getDate();
    endDateMonth = endDate.getMonth();
    endDateYear = endDate.getFullYear();
  }

  var freq;
  if (req.query.frequency !== undefined){
    freq = req.query.frequency;
    if (freq !== '1d' || freq !== '1wk' || freq !== '1mo'){
      freq == '1d';
    }
  } else {
    freq = '1d';
  }

  console.log(req.query.stockShort)
  console.log(startDateMonth, startDateDay, startDateYear);
  console.log(endDateMonth, endDateDay, endDateYear);
  console.log(freq);
  var stockData = await yahooStockPrices.getHistoricalPrices(startDateMonth, startDateDay, startDateYear, endDateMonth, endDateDay, endDateYear, req.query.stockShort, freq);
  var closePrices = stockData.map( data => {return data.close});
  var datesLabels = stockData.map( item => {return item.date});

  res.render('companyInfo', 
    {
      companyName: stockInfo[0].company,
      companyShort: stockInfo[0].shortcut,
      companyPrice: stockInfo[0].price,
      companyBuy: stockInfo[0].buy,
      companySell: stockInfo[0].sell,
      companyWait: stockInfo[0].wait,
      chartData: closePrices,
      chartLabels: JSON.stringify(datesLabels),
      test: stockData,
    });
});

module.exports = router;