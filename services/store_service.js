const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const {Store, Review} = require('../models');
const review = require('./review_service');
const geoTrans = require("./geoTrans")

const findStore = async (req, res, next) => {
    var geo = new geoTrans.GeoTrans();
    geo.init("katec", "geo");
    var pt = new geoTrans.Point(parseInt(req.query.store_posx), parseInt(req.query.store_posy));  
    var out_pt = geo.conv(pt);
    await Store.findOne({
        where: {
            store_name: req.query.store_name,
            store_posx: out_pt.x,
            store_posy: out_pt.y
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
    var geo = new geoTrans.GeoTrans();
    geo.init("katec", "geo");
    var pt = new geoTrans.Point(parseInt(req.body.store_posx), parseInt(req.body.store_posy));
    var out_pt = geo.conv(pt);
    await Store.create({
        store_name: req.body.store_name,
        store_posx: out_pt.x,
        store_posy: out_pt.y,
        store_address: req.body.store_address
    }).then((store) => {
        return res.status(200).json({ store_id : store.store_id });
    }).catch((err) => {
        next(httpError(500,err.message));
    });
};

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