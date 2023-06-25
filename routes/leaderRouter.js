const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());
const cors = require('./cors');

const factorX = 'leader';

leaderRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    // login first to get all leaders
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.end(`Will send all the ${factorX}s to you!`);
    })
    // only admin can do post, put, delete
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end(`Will add the ${factorX}: ` + req.body.name + ' with details: '
            + req.body.description);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /${factorX}s`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end(`Deleting all ${factorX}s`);
    })

leaderRouter.route(`/:leaderId`)
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    // login first to get specific leader
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.end(`Get the ${factorX} ` + req.params.leaderId + '!')
    })
    // only admin can do post, put, delete
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end('POST method not supported');
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`Will update the ${factorX}: ` + req.params.leaderId
            + ' with name ' + req.body.name
            + ', with details: ' + req.body.description);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end(`Deleted ${factorX} ` + req.params.leaderId + '!');
    })

module.exports = leaderRouter;