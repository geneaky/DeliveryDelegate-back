//require('dotenv').config();

const path = require('path');
require('dotenv').config({ path: __dirname + "/develop.env" });


module.exports = {
    secretKey : process.env.secret,
    option: {
        algorithm: 'HS256',
        expiresIn: '30m',
        issuer: 'moon_rabbit'
    }
}