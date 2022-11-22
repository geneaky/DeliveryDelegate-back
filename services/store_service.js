const httpError = require('http-errors');
const axios = require('axios');
const {Store, Review} = require('../models');
const review = require('./review_service');
require('dotenv').config();

const kakaoMap = axios.create({
    baseURL : "https://dapi.kakao.com/v2/local/geo",
    headers : {
        'Authorization' : `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
    }
});


const findStore = async (req, res, next) => {
    await kakaoMap.get(`transcoord.json?x=${req.query.store_posx}&y=${req.query.store_posy}&input_coord=KTM&output_coord=WGS84`)
    .then(async (result)=>{
        const [geo] = result.data.documents

        await Store.findOne({
            where: {
                store_name: req.query.store_name,
                store_posx: geo.x,
                store_posy: geo.y,
            }
        }).then((store) => {
            if(store) {
                return res.status(200).json({ store_id: store.store_id, message: "store existed"});
            }
            return res.status(404).json({ store_id: "null" ,message: "store not existed"});
        }).catch((err) => {
            next(httpError(500, err.message));
        })
    })
}

const registerStore = async (req, res, next) => {
    await kakaoMap.get(`transcoord.json?x=${req.body.store_posx}&y=${req.body.store_posy}&input_coord=KTM&output_coord=WGS84`)
        .then(async (result)=>{
            const [geo] = result.data.documents   
            
            await Store.create({
                store_name: req.body.store_name,
                store_posx: geo.x,
                store_posy: geo.y,
                store_address: req.body.store_address
            }).then((store) => {
                return res.status(200).json({ store_id : store.store_id });
            }).catch((err) => {
                next(httpError(500,err.message));
            });
        })
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