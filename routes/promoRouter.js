const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

const factorX = 'promotions';

promoRouter.route('/')
    .all(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    // login first to get all promotions
    .get(authenticate.verifyUser, (req, res, next) => {
        res.end(`Will send all the ${factorX} to you!`);
    })
    // only admin can do post, put, delete
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end(`Will add the ${factorX}: ` + req.body.name + ' with details: '
            + req.body.description);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /${factorX}`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end(`Deleting all ${factorX}`);
    })

promoRouter.route(`/:promoId`)
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    // login first to get specific promotion
    .get(authenticate.verifyUser, (req, res, next) => {
        res.end(`Get the ${factorX} ` + req.params.promoId + '!')
    })
    // only admin can do post, put, delete
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end('POST method not supported');
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`Will update the ${factorX}: ` + req.params.promoId
            + ' with name ' + req.body.name 
            + ', with details: ' + req.body.description);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.end(`Deleted ${factorX} ` + req.params.promoId + '!');
    })

module.exports = promoRouter;