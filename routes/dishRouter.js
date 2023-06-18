const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

// Create, Read, Delete => dish
dishRouter.route('/')
    // login first to see all dishes
    .get(authenticate.verifyUser, (req, res, next) => {
        Dishes.find({})
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    // only admin can do post, put, delete
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish Created', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    // login first to get specific dish
    .get(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    // only admin can do post, put, delete
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err))
    })

dishRouter.route('/:dishId/comments')
    .get(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
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
    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    // add user id before save
                    const userId = req.user._id;
                    req.body.author = userId;

                    dish.comments.push(req.body);
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
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
    })
    // only admin can do delete all comments of specific dish
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    // login first to get specific dish comment
    .get(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments.id(req.params.commentId));
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    // only author can put and delete their comment
    .put(authenticate.verifyUser, (req, res, next) => {
        const userId = req.user._id;

        // find author id from db
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                const authorId = dish.comments.id(req.params.commentId).author;

                // check if id of logged in user equals to author id
                if (userId.equals(authorId)) {

                    // findOneAndUpdate can only update or add the existing, so we cannot use $set: req.body
                    Dishes.findOneAndUpdate({ "_id": req.params.dishId, "comments._id": req.params.commentId },
                        {
                            $set: {
                                "comments.$.rating": req.body.rating,
                                "comments.$.comment": req.body.comment
                            }
                        }, { new: true })
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish.comments.id(req.params.commentId));
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        const userId = req.user._id;

        // find author id from db
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                const authorId = dish.comments.id(req.params.commentId).author;

                // check if id of logged in user equals to author id
                if (userId.equals(authorId)) {
                    // delete specific comment
                    Dishes.findByIdAndUpdate({ "_id": req.params.dishId, "comments._id": req.params.commentId },
                        {
                            $pull: {
                                'comments': {
                                    "_id": req.params.commentId
                                }
                            }
                        }, { new: true })
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json("Deleted comment id: " + req.params.commentId);
                        }, (err) => next(err))
                        .catch((err) => next(err))
                } else {
                    err = new Error('You are not authorized to delete this comment: ' + req.params.commentId);
                    err.statusCode = 403;
                    next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })

module.exports = dishRouter;