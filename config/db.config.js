require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: process.env.DEVELOPMENT_DATABASE_PASSWORD,
        database: 'mysql',
        host: 'mysql',
        dialect: 'mysql'
    }
}