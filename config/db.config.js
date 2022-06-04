//require('dotenv').config();

const path = require('path');
require('dotenv').config({ path: __dirname + '/develop.env' });

module.exports = {
    development: {
        username: 'root',
        password: process.env.DEVELOPMENT_DATABASE_PASSWORD,
        database: process.env.DATABASE,
        host: process.env.HOST,
        dialect: 'mysql'
    }
}