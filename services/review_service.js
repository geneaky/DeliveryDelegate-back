const path = require('path');
require('dotenv').config({ path: __dirname + '/develop.env' });
const jwt = require('../api/middlewares/jwt');
const { Review,User,Store, Thumb } = require('../models');
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

const findThumb = async (userId, reviewId) => {
    const nowUserThumb = await Thumb.findOne({ 
        where: {
            user_id : userId,
            review_id : reviewId,
            }
    })
    .catch((err) => {
        return err
    });

    if(!nowUserThumb){
        console.log("NULL")
        return nowUserThumb;
   } else{
       console.log("(함수) nowUserThumb", nowUserThumb.dataValues)
       return nowUserThumb.dataValues;
   }
}


const recieptAuth = async (req, res, next) => {
    try{
        const jwtToken = req.header('token');
        const user = await jwt.verify(jwtToken);
        console.log("(token) user id : ",user.id);

        let img = req.file;
        console.log("(multipart) req.file : ",img)

        if (typeof img === "undefined") {
            return res.status(500).json({ message: "undefined image file(no req.file) "});
        }
        
        const type = req.file.mimetype.split('/')[1];
        /*if (type !== 'jpeg' && type !== 'jpg' && type !== 'png') {
            return res.status(500).json({ message: "Unsupported file type"});
        }*/
        if (type === 'HEIC') {
            return res.status(500).json({ message: "file type : HEIC"});
        }
        const recieptAll = await visionOCR(img.path)
        console.log("ocr result : ", recieptAll)

        console.log("req.body.store_id : ", req.body.store_id)

        let store = await Store.findOne({
        where: {
            store_id : req.body.store_id
            }
        }).catch((err) => {
            next(httpError(500,err.message));
        })
        
        console.log("typeof store",typeof store);

        if(typeof store === "undefined" || !store){
            console.log("can't find store");
            return res.status(500).json({ message: "can't find store"});
        }
        store = store.dataValues;
        console.log("선택한 음식점 정보 :", store)
        


        let countSu = 0;

        for(let i=0; i<store.store_name.length; i++){
            if(recieptAll.includes(store.store_name[i])){
                countSu += 1;
            }
            else {
                console.log(store.store_name[i]," 는 영수증에 없음")
            }
        }
         if(countSu > Math.floor(store.store_name.length/2)){
            console.log("진짜 성공")
            return res.status(200).json({ message: "Reciept Verified"});
            
         }
         else {
            console.log('Receipt recognition failure');
            return res.status(200).json({ message: "Receipt verification failed"});
         }
        
        //res.status(200).json({ message: recieptAll });

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
                image_path : img,
                thumb_up:0
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
        let status = ""
        console.log("(token) user id : ",user.id);
        console.log("req.body.review_id : ",req.body.review_id)
        const existingThumbId = await findThumb(user.id, req.body.review_id)
        
        if (!existingThumbId || typeof existingThumbId === 'undefined'){
            await Thumb.create({
                user_id : user.id, 
                review_id :req.body.review_id,
                thumb_count:0
                });
        }
       
        await Thumb.update({ 
            thumb_count: Sequelize.literal('thumb_count + 1'), }, 
            { where: { 
                review_id : req.body.review_id,
                user_id : user.id
                } 
        });

        const count = await findThumb(user.id, req.body.review_id)
        if(count.thumb_count % 2 === 0){  //좋아요 취소
            status = 'thumb Down';
            await Thumb.update({ thumb_up: false }, 
                { where: { 
                    thumb_id : count.thumb_id
                    } 
                });
            
        }
        else { // 좋아요
            status = 'thumb Up';
            await Thumb.update( { thumb_up: true }, 
                { where: { 
                    thumb_id : count.thumb_id
                    } 
            });
            
        }
    

        const ReviewThumbCount = await Thumb.findAndCountAll({
            where: {
                review_id : req.body.review_id,
                thumb_up: true
            }
         })

         console.log("ReviewThumbCount :", ReviewThumbCount.count);
         await Review.update( { thumb_up: ReviewThumbCount.count }, 
            { where: { 
                review_id : req.body.review_id,
                } 
        });
    
         return res.status(200).json({message : `${ReviewThumbCount.count}, ${status}`});
    } catch(error){
        res.status(500).json({ message: error.message })
    }
};

const allReview = async (req, res, next) => {
    let thumb_count = []
    const reviews = await Review.findAll()
    .catch((err) => {
        return next(err);
    })
    for (let i=1; i<=reviews.length; i++){ 
        let ReviewThumbCount = await Thumb.findAndCountAll({
            where: {
                review_id : i,
                thumb_up: true
            }
        })
        thumb_count.push([i,ReviewThumbCount.count]);
        console.log(thumb_count);
    }
    res.status(200).json({
        message: reviews
    });
}





module.exports = {writeReview, recieptAuth, thumbUp, allReview };