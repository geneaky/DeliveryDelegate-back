/* [/store/...] 가게 정보를 불러오는 파일  */
const express = require('express');
const router = express.Router();

router.get('/:id', function(req, res) {
    const name = req.params.name; // 가게 아이디
    res.send('가게의 모든 정보 출력');
});

router.get('/:name', function(req, res) {
    const name = req.params.name; // 가게 이름(아이디)
    res.send('해당 가게의 리뷰 조회');
});

module.exports = router;