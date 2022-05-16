const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const {User} = require('../models');
const {Review} = require('../models');
const crypto = require('crypto');



const writwReview = async function(req, res, next){

    try{
    /*if(사용자정보X && 가게정보X && 리뷰 내용 XX) {
        return res.json({
            message: 'Review registration failed'
        });
    }*/
    console.log(res.json(req.decoded));
    console.log(req.params.storeid, req.body.review)

    /*
    await Review.create({
        user_id : req.get(userid), // 사용자 정보
        store_id :req.params.storeid,
        content: req.body.review,
    });



    let counta = await Review.findAndCountAll({ // 리뷰 개수 조회
        where: {
            user_id : req.get(userid), // 사용자 정보
        }
    });

    // 면제권 제공
    if(counta % 10 == 0){
        await User.increment('exemption_count', {by: 1}, //db에 추가할 것
            {where : {
                user_id : req.get(userid),
            }}
        );
        res.status(200).json({message : 'Provide exemption '});
    }*/
   

    res.status(200).json({message : 'Review registered'});
} catch(error){
    res.status(500).send({ message: error.message });
}
};



module.exports = writwReview;