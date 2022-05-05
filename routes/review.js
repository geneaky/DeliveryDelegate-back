/* 사용자 리뷰를 불러오는 파일 */
const express = require('express');
const router = express.Router();

router.post('/review/post/:id', function(req, res) {
    const name = req.params.name; // 작성자 아이디
    res.send('로그인한 사용자가 리뷰작성');
});

router.get('/review/:id', function(req, res) {
    const name = req.params.name; // 작성자 아이디
    res.send('사용자가 작성한 리뷰 조회');
});

module.exports = router;