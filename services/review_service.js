const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const { Review,User,Store, Thumb } = require('../models');
const Sequelize = require('sequelize');
const vision = require('@google-cloud/vision');

const visionOCR = async (img) => {
    try{
    console.log("OCR");
    const client = new vision.ImageAnnotatorClient({
        keyFilename:'new-vision-key.json'
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

const addName = async (array) => {
    for (const item of array) {   
        let userName = await User.findOne({
            where: {
                user_id :  item.user_id
                }
            });
        item.dataValues['user_name'] = await userName.dataValues.nickname;
        let storeName = await Store.findOne({
            where:{
                store_id : item.store_id
            }
        });
        item.dataValues['store_name'] = await storeName.dataValues.store_name;
    }
    return array;
}


const isBadword = async (str) =>{
    try{
        console.log("작성 내용 : ", str);
        if(str.length < 10 ){
            return "too short"
        }
        else if(str.includes('시발') || str.includes('새끼') || str.includes('바보')){
            return "bad word" 
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
        if (type !== 'jpeg' && type !== 'jpg' && type !== 'png') {
            return res.status(500).json({ message: "Unsupported file type"});
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
        await Store.findOne({
            where: {
                store_id : req.body.store_id
                }
            }).then((store)=>{
                if(typeof store === "undefined" || !store){
                    console.log("존재하지 않음 : ", store);
                    throw new Error("can't find store")
                    //return res.status(500).json({ message: "can't find store"})
                } else{
                    console.log("존재합 : ", store);
                }
                return;
            });

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
            return res.status(500).json({message:pass});
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
        //console.log(error);
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
    let reviews = await Review.findAll()
    .catch((err) => {
        return next(err);
    })
    if (reviews.length === 0){
        return res.status(200).json({message:reviews});
    } else {
        const result = await addName(reviews);
        return res.status(200).json({message:result});
    }
    
}



module.exports = {writeReview, recieptAuth, thumbUp, allReview, addName };