require('dotenv').config();


module.exports = {
    secretKey : process.env.secret,
    option: {
        algorithm: 'HS256',
        expiresIn: '7d',
        issuer: 'moon_rabbit'
    }
}