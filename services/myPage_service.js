const jwt = require('../api/middlewares/jwt');
const { User, Review } = require("../models")
const reviewService = require("./review_service")

/**
 * @todo  개인정보 화면
 */
const viewMyPage = async (req,res,next)=>{
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);
        const userInfo = await User.findByPk(user.id);
        let countReview = await Review.findAndCountAll({ // 리뷰 개수 조회
            where: {
                user_id : user.id, 
            }
        });
        userInfo.dataValues['count'] = await countReview.count;
        res.status(200).json({userInfo})
    }catch (err){
        console.log(err)
        return res.status(500).json({err});
    }
}


/**
 * @todo  사용자가 작성한 리뷰들 화면
 */
 const viewMyReviewPage = async (req,res,next)=>{
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);
        let re = await Review.findAll({
            where: {
                user_id : user.id, 
            }
        });
        console.log(re)
        const reviews = await reviewService.addName(re)
        console.log(reviews)
        res.status(200).json({message:reviews})
    }catch (err){
        console.log(err)
        return res.status(500).json({err});
    }
}

/**
 * @todo  개인정보 수정
 */
const updateUserInfo = async (req,res,next)=>{
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);

        const nickname = req.body.nickname;
        if(!nickname || typeof nickname =='undefined'){
            return res.status(500).json({message:"변경할 닉네임을 입력해주세요"});
        }
        await User.update({
            nickname:nickname
        },{
            where:{
                user_id:user.id
            }
        }).catch((err)=>{
            throw new Error(err)
        });
        return res.status(200).json({message:"change nickname"});
    }catch(err){
        return res.status(500).json({err});
    }
}

module.exports = {
    viewMyPage,
    updateUserInfo,
    viewMyReviewPage
}
