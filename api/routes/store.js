/* 가게 정보를 불러오는 파일 */
const express = require('express');
const router = express.Router();

router.get('/',(req,res,next) => {
    res.json({
        test: "success"
    })
})

module.exports = router;