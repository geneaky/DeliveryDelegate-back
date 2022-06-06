require('dotenv').config();


module.exports = {
    development: {
        username: 'root',
        password: process.env.DEVELOPMENT_DATABASE_PASSWORD,
        database: process.env.DATABASE,
        host: process.env.HOST,
        dialect: 'mysql'
    }
}