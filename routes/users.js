const express = require('express');
const User = require('../models/user');

const router = express.Router();


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/signup', (req, res, next) => {
  //Check if username isn't alrady taken
  User.findOne({ username: req.body.username })
    .then(user => {
      //We'll either have a user document, or a null value meaning no user with that username was found
      if (user) {
        const err = new Error(`User ${req.body.username} already exists!`);
        //Forbidden error status
        err.status = 403;
        return next(err);
      } else {
        //Create user document
        User.create({
          username: req.body.username,
          password: req.body.password
        })
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Registration Successful!', user: user });
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
  //Check if user's logged in/We're already tracking a user authenticated session
  if (!req.session.user) {
    //Need to login the user.  Simiilar to code from auth function to authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    //Parse the username and password from authheader string, and put in new array ['admin', 'password']
    //Buffer is a global class in node. The from() method will decode username and password from credentials
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    //check username and password sent from request, and check against what's in the database
    //Use findOne() on users collection to do this
    User.findOne({ username: username })
      .then(user => {
        if (!user) {
          const err = new Error(`User ${username} does not exist`);
          err.status = 401;
          return next(err);
        } else if (user.password !== password) {
          const err = new Error('Your password is incorrect');
          err.status = 401;
          return next(err);
        } else if (user.username === username && user.password === password) {
          //Authenticate user/setup session/begin tracking session
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end('You are authenticated!');
        }
      })
      .catch(err => next(err));
  } else {
    //There's a session already being tracked AKA this client is already logged in
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already autheticated');
  }
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
