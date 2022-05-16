const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const { Review } = require('../models');
const { User } = require('../models');
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

module.exports = writwReview;