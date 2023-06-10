const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

const factorX = 'promotions';

promoRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end(`Will send all the ${factorX} to you!`);
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.end(`Will add the ${factorX}: ` + req.body.name + ' with details: '
            + req.body.description);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /${factorX}`);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        res.end(`Deleting all ${factorX}`);
    })

promoRouter.route(`/:promoId`)
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end(`Get the ${factorX} ` + req.params.promoId + '!')
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.end('POST method not supported');
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`Will update the ${factorX}: ` + req.params.promoId
            + ' with name ' + req.body.name 
            + ', with details: ' + req.body.description);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        res.end(`Deleted ${factorX} ` + req.params.promoId + '!');
    })

module.exports = promoRouter;