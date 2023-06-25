const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Dishes = require('../models/dishes');
const cors = require('./cors');

const dishRouter = express.Router();

// Create, Read, Delete => dish
dishRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    // login first to see all dishes
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    // only admin can do post, put, delete
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish Created', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.deleteMany({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err))
    })

// Create, Read, Delete => dish by Id
dishRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    // login first to get specific dish
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    // only admin can do post, put, delete
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err))
    })

dishRouter.route('/:dishId/comments')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    req.body.author = req.user._id;
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })

                        }, (err) => next(err))
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
    })
    // only admin can do delete all comments of specific dish
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (var i = dish.comments.length - 1; i >= 0; i--) {
                        dish.comments.id(dish.comments[i]._id).deleteOne();
                    }
                    dish.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => next(err))
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })

dishRouter.route('/:dishId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    // login first to get specific dish comment
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments.id(req.params.commentId));
                } else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    // only author can put and delete their comment
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const userId = req.user._id;

        // find author id from db
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                // check logged in user is author or not
                if (!req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
                    err = new Error('You are not authorized to edit this comment!');
                    err.status = 404;
                    return next(err);
                } else {
                    if (dish != null && dish.comments.id(req.params.commentId) != null) {
                        if (req.body.rating) {
                            dish.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        if (req.body.comment) {
                            dish.comments.id(req.params.commentId).comment = req.body.comment;
                        }
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dish);
                                    })
                            }, (err) => next(err));
                    } else if (dish == null) {
                        err = new Error('Dish ' + req.params.dishId + ' not found');
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error('Comment ' + req.params.commentId + ' not found');
                        err.status = 404;
                        return next(err);
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));

    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const userId = req.user._id;

        // find author id from db
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                // check logged in user is author or not
                if (!req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
                    err = new Error('You are not authorized to delete this comment!');
                    err.status = 404;
                    return next(err);
                } else {
                    if (dish != null && dish.comments.id(req.params.commentId) != null) {

                        dish.comments.id(req.params.commentId).deleteOne();
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dish);
                                    })
                            }, (err) => next(err));
                    } else if (dish == null) {
                        err = new Error('Dish ' + req.params.dishId + ' not found');
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error('Comment ' + req.params.commentId + ' not found');
                        err.status = 404;
                        return next(err);
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = dishRouter;