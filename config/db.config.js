//require('dotenv').config();

const path = require('path');
require('dotenv').config({ path: __dirname + '/develop.env' });


module.exports = {
    development: {
        username: 'root',
        password: process.env.DEVELOPMENT_DATABASE_PASSWORD,
        database: 'dal2', //daldaepyo mysql
        host: '127.0.0.1', // 127.0.0.1 mysql
        dialect: 'mysql'
    }
}