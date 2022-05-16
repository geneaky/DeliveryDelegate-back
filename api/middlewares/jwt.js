const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const {secretKey, option} = require('../../config/jwt.config');
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

const sign = async (user) => {

    const payload = {
        id : user.user_id,
    };

    const result = {
        token : jwt.sign(payload, secretKey, option),
        refreshToken: randToken.uid(256)
    }

    return result;
}

const verify = async (token) => {
    let decoded;
    try {
        decoded = jwt.verify(token, secretKey, option);
        console.log(decoded);
    } catch (err) {
        if (err.message === 'jwt expired') {
            console.log('expired token');
            return TOKEN_EXPIRED;
        } else {
            console.log(err);
            console.log('invalid token');
            return TOKEN_INVALID;
        }
    }

    return decoded;
}

module.exports = {sign, verify}