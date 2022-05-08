const Sequelize = require('sequelize');
const User = require('./user'); 
const Thumb = require('./thumb'); 
const Store = require('./store'); 
const Game = require('./game'); 
const Review = require('./review'); 
const Delegator = require('./delegator'); 


const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;


db.User = User;
db.Store = Store;
db.Review = Review;
db.Thumb = Thumb;
db.Delegator = Delegator;
db.Game = Game;

User.init(sequelize);
Store.init(sequelize);
Review.init(sequelize);
Delegator.init(sequelize);
Thumb.init(sequelize);
Game.init(sequelize);

User.associate(db);
Store.associate(db);
Review.associate(db);
Delegator.associate(db);
Game.associate(db);
Thumb.associate(db);


module.exports = db;