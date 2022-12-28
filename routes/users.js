const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();


/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()
    .then(user => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
    })
    .catch(err => next(err));
});


router.post('/signup', (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        //Internal server error
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        //Save user to database
        user.save(err => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          //Use passport to authenticate user
          //passport.authenticate returns a function, and we pass req/res in as argument
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    }
  );
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  //Create token
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //Add token to response header
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

//Logging out the user
router.get('/logout', (req, res, next) => {
  //Check if a session exists
  if (req.session) {
    //Destroy the session. Deletes session file on server side.If client tries to authenticate it won't be recognized by server
    req.session.destroy();
    //Express method. Pass in the name of session we configured (in App.js)
    res.clearCookie('session-id');
    //Redirects user a differet path. In this case, the root path
    res.redirect('/');
  } else {
    //If a session doesn't exist
    const err = new Error('You are not logged in');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
