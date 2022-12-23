var createError = require('http-errors');
var express = require('express');
var path = require('path');
//We're using sessions now, which creates its own cookies and has its own cookieparser
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
//When there are 2 sets of parameters in this case: We invoke session-file-store, which returns a return function, then we're calling it with session
const Filestore = require('session-file-store')(session);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

//connect to MongoDB
const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//1st argument occurs if promise resolves, second argument handles rejected case. Other way to handle promise rejection besides catch()
connect.then(() => console.log('Connected correctly to the server'),
  err => console.log(err)
);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

//Using sessions to track authenticated users
//Will add a property called 'session' to request message
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  //When new sessioin iis created with no updates, at end of request it won't be save because it's just an empty session
  //No cookies will be saved to the client
  saveUninitialized: false,
  //Resave continues resaving session regardless of whether it made updates that needed to be saved.
  resave: false,
  //Use to save session info to server's hard disk instead instead of application memory
  store: new Filestore()
}));

//These routes are above the auth function because we want users to be able to create an account before they get challenged to authenticate themselves
//And since logged out users get directed to index page, we want unauthenticated users to get access to that page, too
app.use('/', indexRouter);
app.use('/users', usersRouter);

//authentication middleware
function auth(req, res, next) {
  console.log(req.session);

  if (!req.session.user) {
    const err = new Error('You are not authenticated');
    err.status = 401;
    return next(err);
  } else {
    //If there is a session.user value in the request
    if (req.session.user === 'authenticated') {
      return next();
    } else {
      const err = new Error('You are not authenticated!');
      res.setHeader();
      err.status = 401;
      return next(err);
    }
  }
};

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
