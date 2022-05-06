require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: process.env.DEVELOPMENT_DATABASE_PASSWORD,
        database: 'daldaepyo',
        host: '127.0.0.1',
        dialect: 'mysql'
    }
}