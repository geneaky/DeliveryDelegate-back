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
        keyFilename:"./new-vision-key.json"
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

const isBadword = async (str) =>{
    try{
        console.log("작성 내용 : ", str);
        if(str.length < 10 ){
            return "작성 내용 10글자 이하"
        }
        else if(str.includes('시발') || str.includes('새끼') || str.includes('바보')){
            return "금칙어 사용" 
        }
        else {
            return "pass"
        }
    } catch (err){
        return err
    }
}


const recieptAuth = async (req, res, next) => {
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);

        let img = req.file;
        console.log("(multipart) req.file : ",img)

        if (img === undefined) {
            return res.status(500).json({ message: "undefined image file(no req.file) "});
        }
        const type = req.file.mimetype.split('/')[1];
        if (type !== 'jpeg' && type !== 'jpg' && type !== 'png') {
            return res.status(500).json({ message: "Unsupported file type"});
        }
    
        const recieptAll = await visionOCR(img.path)
        console.log("ocr result : ", recieptAll)

        console.log("req.body.store_id : ", req.body.store_id)

        const store = await Store.findOne({
        where: {
            store_id : req.body.store_id
            }
        })

        console.log(store)
        if (store === undefined){
            return res.status(500).json({ message: "can't find store"});
        }
        if(recieptAll.includes(store.store_name) || recieptAll.includes(store.store_address)){
            // res.status(200).json({ message: "Reciept Verified"});
        }else{
            console.log('Receipt recognition failure');
            // res.status(200).json({ message: "Reciept recognition failure"});
        }

        res.status(200).json({ message: recieptAll });

    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

const writeReview = async (req, res, next) => {
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);
        let img = req.file;
        console.log("(multipart) req.file : ",req.file)
        console.log("(multipart) req.body : ",req.body)
        let pass = await isBadword(req.body.body) 
        if (typeof img == "undefined") { 
            img = "";
            console.log(img);
        } else {
            const type = req.file.mimetype.split('/')[1];
            if (type !== 'jpeg' && type !== 'jpg' && type !== 'png') {
                return res.status(500).json({ message: "Unsupported file type"});
            }
            img = req.file.path.toString()
        }
   
        // 리뷰등록
        if (pass === "pass"){
            await Review.create({
                user_id : user.id, 
                store_id :req.body.store_id,
                content: req.body.body,
                image_path : img
                });
        } else {
            return res.status(500).json({ message: `[ ${pass} ] 사유로 리뷰 등록에 실패하였습니다.`});
        }   
 
        
        let counta = await Review.findAndCountAll({ // 리뷰 개수 조회
            where: {
                user_id : user.id, 
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

        return res.status(200).json({message : 'Review registered'});

    } catch(error) {
        res.status(500).json({ message: error.message });
    };
};
    

const thumbUp = async (req,res,next) =>{
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);

        let goodReview = await Review.findOne({
            atterbutes : ['review_id'],
            where: {
                user_id : user.id, 
                store_id :req.body.store_id,
            }
        });

        console.log("goodReview : ",goodReview.review_id)
        
        await Thumb.create({
            review_id : ReviewReviewId.review_id,
            thumb_up : 1,
        });

        let thumbUp = await Thumb.findOne({
            where: {
                user_id : user.id, 
                review_id : goodReview.review_id,
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
            return res.status(200).json({message : 'thumb Down '});
        }
        else { // 좋아요
            return res.status(200).json({message : 'thumb UP ! '});
        }

    } catch(error){
        res.status(500).json({ message: error.message });
    }
    
};

const allReview = async (req, res, next) => {

    const reviews = await Review.findAll()
    .catch((err) => {
        return next(err);
    })

    res.status(200).json({
        message: reviews
    });
}



module.exports = {writeReview, recieptAuth, thumbUp, allReview};