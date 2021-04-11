var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;
const bodyParser= require('body-parser');

router.get('/', function(req, res, next) {
    res.render('login');
});

router.get('/register', function(req, res, next) {
    res.render('register');
});

/* POST register */
router.post('/register', async function(req, res, next) {
    var newUserKey = { login: req.body.login, 
                        password: req.body.password};
    let status = await newUserCheck(req);
    console.log(status);
    console.log(req.body);
    if (status == true) {
        var newUser = await req.db.db('myapp')
        .collection('user-data')
        .insertOne(newUserKey)
        console.log("New client: "+newUserKey);
        res.redirect('/');
        alert("Account succesfully created")
    } else {
        res.render('register', {error: status});
    }
});

/* POST login */
router.post('/', async function (req, res, next) {
    if (req.body.password === "" || req.body.login === ""){
        res.render('login', {error: "Login or password can't be empty"});
    } else {
        var user = await req.db.db('myapp')
        .collection('user-data')
        .find({
            "login": req.body.login,
            "password": req.body.password
        })
        .toArray();

        if (typeof user !== 'undefined' && user.length > 0) {
            //localStorage.setItem('user', req.body.login);
            res.redirect('users/?userLogin='+req.body.login);

        } else {
            res.render('login', {error: "No such user found"});
        }
    }
});

async function newUserCheck(req){                         
    var user = await req.db.db('myapp')
        .collection('user-data')
        .find({
            "login": req.body.login
        })
        .toArray();

    if (typeof user !== 'undefined' && user.length > 0) {
        return "User exists";
    }

    if (req.body.password === "" || req.body.login === ""){
        return "Login or password can't be empty";
    }

    if (req.body.password != req.body.passwordCheck) {
        return "Passwords do not match";
    }

    return true;
}

module.exports = router;