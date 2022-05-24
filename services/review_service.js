const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const { Review } = require('../models');
const { User } = require('../models');
const { Thumb } = require('../models');
const Sequelize = require('sequelize');
const crypto = require('crypto');



const writwReview = async (req, res, next) => {
    try{
        /*if(사용자정보X && 가게정보X && 리뷰 내용 XX) {
            return res.json({
                message: 'Review registration failed'
            });
        }*/
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("uid : ",user.id);
        
        
        // 리뷰등록
        await Review.create({
            UserUserId : user.id, 
            StoreStoreId :req.params.storeid,
            content: req.body.body,
        });
       
        let counta = await Review.findAndCountAll({ // 리뷰 개수 조회
            where: {
                UserUserId : user.id, 
            }
        });
    
        // 면제권 제공
        if(counta.count % 10 === 0){
            await User.update({ 
                exemption_count: Sequelize.literal('exemption_count + 1') }, 
                { where: { user_id: user.id } 
            });
            // res.status(200).json({message : 'Provide exemption '});
        }

        res.status(200).json({message : 'Review registered'});
    } catch(error){
        res.status(500).send({ message: error.message });
    };
};


const thumbUp = async (req,res,next) =>{
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("uid : ",user.id);

        let ReviewReviewId = await Review.findOne({
            atterbutes : ['review_id'],
            where: {
                UserUserId : user.id, 
                StoreStoreId :req.params.storeid,
            }
        });

        console.log("ReviewReviewId",ReviewReviewId.review_id)
        
        await Thumb.create({
            ReviewReviewId : ReviewReviewId.review_id,
            thumb_up : 1,
        });

        let thumbUp = await Thumb.findOne({
            where: {
                UserUserId : user.id, 
                ReviewReviewId : ReviewReviewId.review_id,
            }
        });
           
        console.log("thumb_up",thumbUp.thumb_id);

        
        await Thumb.update({ 
            thumb_up: Sequelize.literal('thumb_up + 1') }, 
            { where: { 
                thumb_id : thumbUp.thumb_id
            } 
        });


        //좋아요 취소
        if(thumbUp.thumb_up % 2 === 0){
            res.status(200).json({message : 'thumb Down '});
        }
        else { // 좋아요
            res.status(200).json({message : 'thumb UP ! '});
        }

    } catch(error){
        res.status(500).send({ message: error.message });
    }
    
};


module.exports = {writwReview, thumbUp};