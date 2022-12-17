const express = require('express');
//Model
const Campsite = require('../models/campsite');
const campsiteRouter = express.Router();

campsiteRouter.route('/')
    .get((req, res, next) => {
        Campsite.find()
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                //Will automatically close response stream after sending campsite as json data
                res.json(campsites);
            })
            .catch(err => next(err));
    })
    .post((req, res, next) => {
        //Create Campsite document and send to MongoDB server
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite Created ', campsite)
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete((req, res, next) => {
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
            .then(campsite => {
                res.status = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
            })
            .catch(err => next(err))
    })
    .post((req, res) => {
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put((req, res, next) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
            .then(campsite => {
                res.status = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
            })
            .catch(err => next(err));
    })
    .delete((req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.status = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(response)
            })
            .catch(err => next(err));
    });

module.exports = campsiteRouter; 