var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;

/* GET team */
router.get('/team/', async function(req, res, next) {
    const id = req.query.id;
    let team;
    if (id) {
        team = await req.db.db('myapp')
            .collection('teams')
            .findOne(ObjectId(id));
    } else {
        team = {
            teamName: "",
        }
    }
    res.render('team', { title: 'Edytuj drużynę', team: team });
});

/* POST team */
router.post('/team/', async function (req, res, next) {
    try {
        let team = {
            _id: req.body._id ? ObjectId(req.body._id) : undefined,
            teamName: req.body.team_name,
        };
        if (team._id) {
            await req.db.db('myapp').collection("teams").replaceOne({_id: team._id}, team);
        } else {
            await req.db.db('myapp').collection("teams").insertOne(team);
        }
        res.redirect('/teams/');
    } catch (err) {
        console.error(err);
    }
    //next();
});

/* DELETE team */
router.get('/team-delete/', async function (req, res, next) {
    try {
        let id = req.query.id;
        await req.db.db('myapp').collection("teams").findOneAndDelete({_id: ObjectId(id)});
        res.redirect('/teams/');
    } catch (err) {
        console.error(err);
    }
    //next();
});

/* GET teams. */
router.get('/', async function(req, res, next) {
    const pageSize = 4;
    let searched = req.query.search;
    let query;
    if (searched) {
        query = { $text: { $search: searched } };
    } else {
        query = {};
    }

    let sort = parseInt(req.query.sort);
    sort = sort ? sort : 1;
    const count = await req.db.db('myapp')
        .collection('teams')
        .count({});
    const maxPage = Math.floor(count / pageSize);
    let page = parseInt(req.query.page);
    page = page >= 0 ? page : 0;
    page = page <= maxPage ? page : maxPage;
    const prevPage = page > 0 ? page - 1 : 0;
    const nextPage = page < maxPage ? page + 1 : maxPage;

    let teams = await req.db.db('myapp')
    .collection('teams')
    .find(query)
    .collation({
        locale: 'pl'
    })
    .sort(['teamName', sort])
    .skip(page * pageSize)
    .limit(pageSize)
    .toArray();

    res.render('teams', {
        title: 'Teams',
        teams: teams,
        sort: sort,
        page: page,
        prevPage: prevPage,
        nextPage: nextPage,
        count: count
    });
});


module.exports = router;
