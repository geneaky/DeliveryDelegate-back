const Sequelize = require('sequelize');
const {development} = require('../config/db.config');
const User = require('./user.model');
const Store = require('./store.model');

const db = {};
const sequelize = new Sequelize(development.database, development.username, development.password, {host: development.host, dialect: development.dialect});
db.sequelize = sequelize;

db.User = User(sequelize);
db.Store = Store(sequelize);

module.exports = db;