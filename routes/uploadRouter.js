const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

//custom configuration for how Multer handles file uploads
//storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //1st argument is error object
        //2nd argumenent is path we want to send file to
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        //this makes sure the file name on server will be the same as the file name on the client side
        //If this isn't set, multer will give a random string as the name of the file
        cb(null, file.originalname)
    },
});

//Create a file filter
const imageFileFilter = (req, file, cb) => {
    //Check if file extension is NOT one of these: .jpg, jpeg, png, gif
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        //2nd argument (false) tells Multer to reject file upload
        return cb(new Error('You can upload only image files!'), false);
    }
    //2nd argument tells Multer to accept file
    cb(null, true);
};

//Configure multer module enable image file uploads
const upload = multer({ storage: storage, fileFilter: imageFileFilter });

const uploadRouter = express.Router();

uploadRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /imageUpload');
    })
    //upload.single('imageFile) means it's expecting a single upload of a file called 'imageFile'
    //When file uploaded, multer handles all errors if any, then processes
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /imageUpload');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /imageUpload');
    })

module.exports = uploadRouter;
