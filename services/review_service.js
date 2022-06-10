const path = require('path');
require('dotenv').config({ path: __dirname + '/develop.env' });
const jwt = require('../api/middlewares/jwt');
const { Review,User,Thumb,Store } = require('../models');
const Sequelize = require('sequelize');
const vision = require('@google-cloud/vision');

const visionOCR = async (img) => {
    try{
    console.log("OCR");
    const client = new vision.ImageAnnotatorClient({
        keyFilename:"../new-vision-key.json"
    });
    let string = '';
    const [result] = await client.textDetection(img);
    const detections = result.textAnnotations;
    console.log('Text:');
    detections.forEach(text => string += text.description);
    console.log('OCR 성공');
    return string;
    } catch(err){
        return err;
    }
}


const recieptAuth = async (req, res, next) => {
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);

        let img = req.file;
        console.log("(multipart) req.file : ",img)

        if (img == undefined) {
            return res.status(500).send({ message: "undefined image file(no req.file) "});
        }
        const type = req.file.mimetype.split('/')[1];
        if (type !== 'jpeg' && type !== 'jpg' && type !== 'png') {
            return res.status(500).send({ message: "Unsupported file type"});
        }
    
        const recieptAll = await visionOCR(img.path)
        console.log("ocr result : ", recieptAll)

        console.log(req.body.store_id)
        // 만약 okhttp.RequestBody[id] 이런 식으로 나온다면 
        // store_id : req.body.store_id.split('y')[1] 로 사용
        const store = await Store.findOne({
        where: {
            store_id : req.body.store_id
            }
        })
        if (store === undefined){
            return res.status(500).send({ message: "can't find store"});
        }
        if(recieptAll.includes(store.store_name) || recieptAll.includes(store.store_address)){
            res.status(200).json({message : 'Reciept Verified'});
        }else{
            console.log('Receipt recognition failure');
            res.status(200).send({ message: "Reciept recognition failure"});
        }
        /*res.status(201).send({
            user : `token 검증된 사용자 id:  ${user.id}`,
            ocr : `OCR 처리 결과 : ${recieptAll}`,
            fileInfo: req.file
        });*/   
    } catch(error) {
        res.status(500).send({ message: error.message });
    }
};

const writwReview = async (req, res, next) => {
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);
        
        
        // 리뷰등록
        await Review.create({
            UserUserId : user.id, 
            StoreStoreId :req.body.storeid,
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
            console.log("Provide exemption");
        }
        res.status(200).json({message : 'Review registered'});

    } catch(error) {
        res.status(500).send({ message: error.message });
    };
};
    

const thumbUp = async (req,res,next) =>{
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);

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
            res.status(201).json({message : 'thumb UP ! '});
        }

    } catch(error){
        res.status(500).send({ message: error.message });
    }
    
};




module.exports = {writwReview, recieptAuth, thumbUp};