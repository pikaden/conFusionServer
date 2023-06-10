const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

const factorX = 'leader';

leaderRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end(`Will send all the ${factorX}s to you!`);
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.end(`Will add the ${factorX}: ` + req.body.name + ' with details: '
            + req.body.description);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /${factorX}s`);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        res.end(`Deleting all ${factorX}s`);
    })

leaderRouter.route(`/:leaderId`)
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end(`Get the ${factorX} ` + req.params.leaderId + '!')
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.end('POST method not supported');
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`Will update the ${factorX}: ` + req.params.leaderId
            + ' with name ' + req.body.name 
            + ', with details: ' + req.body.description);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        res.end(`Deleted ${factorX} ` + req.params.leaderId + '!');
    })

module.exports = leaderRouter;