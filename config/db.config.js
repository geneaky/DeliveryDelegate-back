require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: process.env.DEVELOPMENT_DATABASE_PASSWORD,
        database: 'daldaepyo', //daldaepyo mysql
        host: '127.0.0.1', // 127.0.0.1 mysql
        dialect: 'mysql'
    }
}