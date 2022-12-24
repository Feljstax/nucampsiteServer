const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

const campsiteRouter = express.Router();

campsiteRouter.route('/')
    .get((req, res, next) => {
        Campsite.find()
            //When campsites are retrieved, populate author field of the comments subdocument, 
            //By finding the user document that matches the objectId that's stored there
            .populate('comments.author')
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                //Will automatically close response stream after sending campsite as json data
                res.json(campsites);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        //Create Campsite document and send to MongoDB server
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite Created ', campsite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(response);
            })
            .catch(err => next(err));
    });

//For all comments on a specific campsite
campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                if (campsite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments);
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    req.body.author = req.user._id;
                    campsite.comments.push(req.body);
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) {
                        //Delete all commments
                        campsite.comments.id(campsite.comments[i]._id).remove();
                    }
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

//For a specific comment on a specific campsite
campsiteRouter.route('/:campsiteId/comments/:commentId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                //using id() method again
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments.id(req.params.commentId));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`)
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`)
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                //using id() method again
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    //Check if new rating has been passed in and update if so
                    if (req.body.rating) {
                        campsite.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    //Check if new comment text has been passed in and update if so
                    if (req.body.text) {
                        campsite.comments.id(req.params.commentId).text = req.body.text;
                    }
                    //Save any updates to MongoDB server
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`)
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    //Delete comment
                    campsite.comments.id(req.params.commentId).remove();
                    //Save any updates to MongoDB server
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`)
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`)
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

module.exports = campsiteRouter; 