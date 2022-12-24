const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//The user object that's passed in contains an ID for a user document
exports.getToken = user => {
    //Create a token
    //3rd argument means token expires in 3600 seconds (1 hour). If ommitted, token will not expire
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

//Configure JWT strategy for passport
//opts will contain options for JWT strategy
const opts = {};
//Specifies how jwt should be extracted from incoming request message. 
//It will ask for jwt to be sent in authorization header, and as a bearer token
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//Lets us supply the jwt strategy with the key with which we'll sign this token
opts.secretOrKey = config.secretKey;

//Export the JWT strategy here
exports.jwtPassport = passport.use(
    //1st argument is opts object we created
    //2nd argument is verifyFunction
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            //Find a user with the same id as the one in the token
            //done is an object written in jtw passport module. It does all the work behind the scenes
            User.findOne({ id: jwt_payload.id }, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    //No error, send user object
                    return done(null, user);
                } else {
                    //No error, but no user document found that matched the token
                    return done(null, false);
                }
            });
        }
    )
);

//Verify that incoming request is from an authenticated user
//1st argument means we want to use the json web token strategy
//2nd argument means we're going to use sessons
exports.verifyUser = passport.authenticate('jwt', { session: false });
