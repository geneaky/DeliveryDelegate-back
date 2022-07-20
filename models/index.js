const Sequelize = require('sequelize');
const {development} = require('../config/db.config');
const sequelize = new Sequelize(development.database, development.username, development.password, {host: development.host, dialect: development.dialect});

const User = require('./user.model')(sequelize);
const Store = require('./store.model')(sequelize);
const Game = require('./game.model')(sequelize);
const Delegator = require('./delegator.model')(sequelize);
const Review = require('./review.model')(sequelize);
const Thumb = require('./thumb.model')(sequelize);
const Order = require('./order.model')(sequelize);

// User : Game ==> m:n [Delegator]
User.belongsToMany(Game, {through: Delegator, foreignKey: 'user_id'});
Game.belongsToMany(User, {through: Delegator, foreignKey: 'game_id'});

// Delegator : Order ==> 1:n
Delegator.hasMany(Order, {foreignKey: 'delegator_id'});
Order.belongsTo(Order,{foreignKey:'delegator_id'})

// User : Review ==> 1:n 
User.hasMany(Review, {foreignKey: 'user_id'});
Review.belongsTo(User,{foreignKey: 'user_id'});

// User : Thumb ==> 1:n
User.hasMany(Thumb, {foreignKey: 'user_id'});
Thumb.belongsTo(User,{foreignKey: 'user_id'});

// Review : Thumb ==> 1:n
Review.hasMany(Thumb, {foreignKey: 'review_id'});
Thumb.belongsTo(Review,{foreignKey: 'review_id'});

// Store : Reveiw ==> 1:n 
Store.hasMany(Review, {foreignKey: 'store_id'});
Review.belongsTo(Store,{foreignKey:'store_id'});


const db = {};
db.sequelize = sequelize;


db.User = User;
db.Game = Game;
db.Delegator = Delegator;
db.Store = Store;
db.Review = Review;
db.Thumb = Thumb;
db.Order = Order;


module.exports = db;