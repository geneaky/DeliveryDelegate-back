const express = require('express');
const router = express.Router();
const httpError = require('http-errors');
const axios = require('axios');
require('dotenv').config();

const naverMap = axios.create({
    baseURL : process.env.SEARCH_URL,
    headers : {
        'X-Naver-Client-Id' : process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret' : process.env.NAVER_CLIENT_SECRET
    }
});

router.get('/search/place', async(req, res, next) => {
    const place = encodeURI(req.query.name);
    await naverMap.get(`local.json?query=${place}&display=5`)
        .then((result) => {
        return res.json({result : result.data.items});
        })
        .catch((err) => {
            console.log(err);
            next(httpError(400, 'Bad Request'));
        });
});

module.exports = router;