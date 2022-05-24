require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: process.env.DEVELOPMENT_DATABASE_PASSWORD,
        database: 'mysql', //daldaepyo mysql
        host: 'mysql', // 127.0.0.1 mysql
        dialect: 'mysql'
    }
}