const Sequelize = require('sequelize');
const User = require('./user.model'); 
const Thumb = require('./thumb.model'); 
const Store = require('./store.model'); 
const Game = require('./game.model'); 
const Review = require('./review.model'); 
const Delegator = require('./delegator.model'); 
//const Reciept = require('./reciept.model'); 

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
//db.Reciept = Reciept;

User.init(sequelize);
Store.init(sequelize);
Review.init(sequelize);
Delegator.init(sequelize);
Thumb.init(sequelize);
Game.init(sequelize);
//Reciept.init(sequelize);


User.associate(db);
Store.associate(db);
Review.associate(db);
Delegator.associate(db);
Game.associate(db);
Thumb.associate(db);


module.exports = db;