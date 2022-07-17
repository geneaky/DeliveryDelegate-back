const Sequelize = require('sequelize');
const {development} = require('../config/db.config');
const sequelize = new Sequelize(development.database, development.username, development.password, {host: development.host, dialect: development.dialect});

const User = require('./user.model')(sequelize);
const Store = require('./store.model')(sequelize);
const Game = require('./game.model')(sequelize);
const Delegator = require('./delegator.model')(sequelize);
const Reciept = require('./reciept.model')(sequelize);
const Review = require('./review.model')(sequelize);
const Thumb = require('./thumb.model')(sequelize);
const Order = require('./order.model')(sequelize);

User.belongsToMany(Game, {through: Delegator, foreignKey: 'user_id'});
Game.belongsToMany(User, {through: Delegator, foreignKey: 'game_id'});

// User.belongsToMany(Store, {through: Review, foreignKey: 'user_id'});
// Store.belongsToMany(User, {through: Review, foreignKey: 'store_id'});

Review.hasMany(User, {foreignKey: 'user_id'});
Review.hasMany(Store, {foreignKey: 'store_id'});

Review.hasMany(Reciept, {foreignKey: 'review_id'});
Delegator.hasMany(Order, {foreignKey: 'delegator_id'});

User.belongsToMany(Review, {through: Thumb, foreignKey: 'user_id'});
Review.belongsToMany(User, {through: Thumb, foreignKey: 'review_id'});

const db = {};
db.sequelize = sequelize;


db.User = User;
db.Game = Game;
db.Delegator = Delegator;
db.Store = Store;
db.Receipt = Reciept;
db.Review = Review;
db.Thumb = Thumb;
db.Order = Order;

module.exports = db;