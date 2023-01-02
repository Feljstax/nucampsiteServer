const cors = require('cors');

//setup white list
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    //Returns -1 if index of item is not found
    // Check if origin can be found in white list
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        //Allowing this request to be accepted
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

//This will return a middleware function configured to set a cors header of Access-Control-Allow-Origin on a response object
//with a wildcard as its value. So it will allow CORS for all origins
exports.cors = cors();


//Will return a middleware function. Will check to see if incoming request belongs to a whitelisted origin
//If it does, it'll send back CORS response header of Access-Control-Allow-Origin, with whitelisted origin as value
//If it doesn't, won't include CORS header in response at all
//SO if there's a REST api endpoint where we only want to accept cross-origin requests from one of the whitelisted origins,
//We'll apply this middleware to that endpoint
exports.corsWithOptions = cors(corsOptionDelegate);

