const httpError = require('http-errors');
const {Store, Review} = require('../models');
const review = require('./review_service');



const findStore = async (req, res, next) => {
    await Store.findOne({
        where: {
            store_name: req.query.store_name,
            store_posx: req.query.store_posx,
            store_posy: req.query.store_posy
        }
    }).then((store) => {
        if(store) {
            return res.status(200).json({ store_id: store.store_id, message: "store existed"});
        }
        return res.status(404).json({ store_id: "null" ,message: "store not existed"});
    }).catch((err) => {
        next(httpError(500, err.message));
        })
}

const registerStore = async (req, res, next) => {
    await Store.create({
        store_name: req.body.store_name,
        store_posx: req.body.store_posx,
        store_posy: req.body.store_posy,
        store_address: req.body.store_address
    }).then((store) => {
        return res.status(200).json({ store_id : store.store_id });
    }).catch((err) => {
        next(httpError(500,err.message));
    });

}

const getReviews = async (req, res, next) => {
    console.log(req.params.id)
    await Review.findAll({where:{ store_id: req.params.id}})
        .then(async (result) => {
            if (result.length === 0){
                return res.status(200).json({message: result});
            } else {
                const reviews = await review.addName(result);
                return res.status(200).json({message:reviews});
            }
        })
        .catch((err) => {
            next(httpError(500,err.message));
        });
};

module.exports = {
    findStore,
    registerStore,
    getReviews
}