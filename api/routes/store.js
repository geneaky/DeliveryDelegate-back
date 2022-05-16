/* 가게 정보를 불러오는 파일 */
const express = require('express');
const router = express.Router();
const { Store } = require('../../models');

router.get('/',(req,res,next) => {
    res.json({
        test: "success"
    })
})
router.post('/',async (req,res,next) => {
    await Store.create({
        store_name : req.body.store_name,
        store_xpos : req.body.store_xpos,
        store_ypos : req.body.store_ypos,
        store_address : req.body.store_address
    });
    res.json({
        store : "registerd"
    })
})



module.exports = router;