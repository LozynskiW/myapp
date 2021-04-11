var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;
var yahooStockPrices = require('yahoo-stock-prices');


router.get('/all', async function(req, res, next) {
    var recommendations = await req.db.db('myapp')
    .collection('recommendations-data')
    .find({})
    .toArray();
    
    
res.render('users', {recommendations: recommendations});
});

router.get('/stockInfo', async function(req, res, next) {
    var stockInfo = await req.db.db('myapp')
    .collection('companies-data')
    .find({
        "shortcut":req.query.stockShort
    })
    .toArray();

res.redirect('users/?userLogin='+req.body.userLogin);
});

router.post('/', async function(req, res, next) {
    var existingRecommendation = await req.db.db('myapp')
    .collection('recommendation-data')
    .find({
        "user": req.body.userLogin,
        "shortcut":req.body.stockShort,
        "recommendation": req.body.recommendation,
    })
    .toArray();

    console.log("Body: "+JSON.stringify(req.body.userLogin)+" "+JSON.stringify(req.body.stockShort)+" "+JSON.stringify(req.body.recommendation));
    console.log("Existing recommendation: "+JSON.stringify(existingRecommendation));

    if (existingRecommendation.length > 0 && typeof existingRecommendation !== 'undefined'){
        let error = "You have already recommended that"
        res.redirect('users/?userLogin='+req.body.userLogin);
    } else {
        var companyExistanceCheck = await req.db.db('myapp')
            .collection('companies-data')
            .find({
                "shortcut":req.body.stockShort,
            })
            .toArray();
        
        if (companyExistanceCheck.length > 0 && typeof companyExistanceCheck !== 'undefined'){

            var newRecommendation = { 
                user: req.body.userLogin, 
                stockShort: req.body.stockShort,
                recommendation: req.body.recommendation,
                date: JSON.stringify(Date.now()),
            };
            console.log("New recommendation: "+JSON.stringify(newRecommendation));

            var insertNewRecommendation = await req.db.db('myapp')
            .collection('recommendation-data')
            .insertOne(newRecommendation);
            console.log("New insert");
            let query;
            if (req.body.recommendation === "buy") query = { "buy" : 1};
            if (req.body.recommendation === "sell") query = { "sell" : 1};
            if (req.body.recommendation === "wait") query = { "wait" : 1};
        
            await req.db.db('myapp')
            .collection('companies-data')
            .findOneAndUpdate(
                {
                "shortcut": req.body.stockShort
                },{
                    $inc: query
                });
            console.log("Updated");
            res.redirect('users/?userLogin='+req.body.userLogin);
        } else {
            res.redirect('users/?userLogin='+req.body.userLogin);
        }
    }

});


router.post('/addNew', async function(req, res, next) {

    var existingCompanyCheck = await req.db.db('myapp')
    .collection('company-data')
    .find({
        "company": req.body.company,
        "shortcut":req.body.stockShort,
    })
    .toArray();

    try {
        const data = await yahooStockPrices.getCurrentData(req.body.stockShort);
    } catch (e){
        res.redirect('/users/?NewCompanyError='+"No such company in YahooFinance DB");
    }
    
    if (existingCompanyCheck.length > 0 && typeof existingCompanyCheck !== 'undefined'){
        console.log("No such company");
        //res.redirect('/users/?userLogin='+req.body.userLogin);
        console.log("321");
        //res.render('users', {NewCompanyError: "No such company in YahooFinance DB"});
        res.redirect('/users/?NewCompanyError='+"No such company in YahooFinance DB");
    } else {
        console.log("123");
        var newCompany = { 
            company: req.body.company, 
            shortcut: req.body.stockShort,
            price: req.body.stockPrice,
            buy: 0,
            sell: 0,
            wait: 0,
        };
    
        await req.db.db('myapp')
            .collection('companies-data')
            .insertOne(newCompany);
        res.redirect('/users/?userLogin='+req.body.userLogin);
    }
});

router.get('/past', async function(req, res, next){
    var pastRecommendations = await req.db.db('myapp')
        .collection('recommendation-data')
        .find({
            "user": req.query.userLogin
        })
        .toArray();

    res.render('recommendation', {userLogin: req.query.userLogin, recommendations: pastRecommendations});
});

router.post('/delete', async function(req, res, next){
    try {
        let id = req.body.stockID;

        var update = await req.db.db('myapp')
            .collection("recommendation-data")
            .find({_id: ObjectId(id)})
            .toArray();
        var user = update[0].user;
        await req.db.db('myapp')
            .collection("recommendation-data")
            .findOneAndDelete({_id: ObjectId(id)});
        let query;
        if (update[0].recommendation === "buy") query = { "buy" : -1};
        if (update[0].recommendation === "sell") query = { "sell" : -1};
        if (update[0].recommendation === "wait") query = { "wait" : -1};
    
        await req.db.db('myapp')
        .collection('companies-data')
        .findOneAndUpdate(
            {
            "shortcut": update[0].stockShort
            },{
                $inc: query
            });

        res.redirect('/recommendation/past/?userLogin='+user);
    } catch (err) {
        console.error(err);
    }
});
module.exports = router;