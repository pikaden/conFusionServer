var express = require('express');
const bodyParser = require('body-parser');
var Favorites = require('../models/favorite');
var passport = require('passport');
var authenticate = require('../authenticate');

const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ "postedBy": req.user._id })
            .populate('postedBy')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "postedBy": req.user._id })
            .then((favorites) => {
                if (favorites != null) {
                    // add dish which has not been existed in db
                    for (var i = 0; i < req.body.dishes.length; i++) {
                        if (favorites.dishes.indexOf(req.body.dishes[i]._id) == -1) {
                            favorites.dishes.push(req.body.dishes[i]._id);
                        }
                    }

                    // update favorite
                    Favorites.updateOne(favorites)
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err));
                } else {
                    // if user did not create favorite

                    // add user created
                    req.body.postedBy = req.user._id;

                    Favorites.create(req.body)
                        .then((favs) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favs);
                        })
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.deleteMany({ "postedBy": req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err))
    })

favoriteRouter.route('/:dishId')
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "postedBy": req.user._id })
            .then((favorites) => {
                if (favorites != null) {
                    // add dish which has not been existed in db
                    for (var i = 0; i < favorites.dishes.length; i++) {
                        if (favorites.dishes.indexOf(req.params.dishId) == -1) {
                            favorites.dishes.push(req.params.dishId);
                        }
                    }

                    // update favorite
                    Favorites.updateOne(favorites)
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err));
                } else {
                    // if user did not create favorite

                    // add user created
                    req.body.postedBy = req.user._id;

                    Favorites.create(req.body)
                        .then((favs) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favs);
                        })
                }
            })
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ "postedBy": req.user._id })
            .then((favorites) => {
                if (favorites != null) {
                    // remove dish which has been existed in db
                    for (var i = 0; i < favorites.dishes.length; i++) {
                        if (favorites.dishes.indexOf(req.params.dishId) != -1) {
                            favorites.dishes.remove(req.params.dishId);
                        } else {
                            // dish has not been existed in db
                            err = new Error('Dish ' + req.params.dishId + ' is not found in user list favorite');
                            err.statusCode = 404;
                            return next(err);
                        }
                    }

                    // update favorite
                    Favorites.updateOne(favorites)
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err));
                } else {
                    // if user did not create favorite

                    err = new Error('User does not have favorite list');
                    err.statusCode = 404;
                    return next(err);
                }
            })
    })

module.exports = favoriteRouter;