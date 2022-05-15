const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const {Store, Review} = require('../models');

const registerStore = async (req, res, next) => {
    await Store.create({
        store_name: req.body.store_name,
        store_xpos: req.body.store_xpos,
        store_ypos: req.body.store_ypos,
        store_address: req.body.store_address
    }).then(() => {
        return res.status(200).end();
    }).catch((err) => {
        next(httpError(500,err.message));
    });
};

const getReviews = async (req, res, next) => {
    await Review.findAll({ store_id: req.params.id})
        .then((result) => {
            return res.json({reviews: result});
        })
        .catch((err) => {
            next(httpError(500,err.message));
        });
};

module.exports = {
    registerStore,
    getReviews
}