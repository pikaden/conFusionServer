var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

const cors = require('./cors');
router.use(bodyParser.json());

/**
 * GET users listing. 
 * only admin can get all users
 * */
router.get('/', cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  User.find()
    .then((user) => {
      if (user) {
        res.json(user);
      }
    })
    .catch((err) => {
      throw err;
    })
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  const newUser = new User({ username: req.body.username, admin: req.body.admin });

  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      // err is set by default of passport
      res.json({ err: err });
    } else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;

      user.save()
        .then((user) => {
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' })
          })
        })
        .catch((err) => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
          return;
        })
    }
  });
})

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in' });
})

router.get('/logout', cors.cors, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
})

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res, next) => {
  if (req.user) {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in' });
  }
})

module.exports = router;
