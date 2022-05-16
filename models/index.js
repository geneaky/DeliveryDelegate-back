const Sequelize = require('sequelize');
const {development} = require('../config/db.config');
const sequelize = new Sequelize(development.database, development.username, development.password, {host: development.host, dialect: development.dialect});

const User = require('./user.model')(sequelize);
const Store = require('./store.model')(sequelize);
const Game = require('./game.model')(sequelize);
const Delegator = require('./delegator.model')(sequelize, User, Game);
const Reciept = require('./reciept.model')(sequelize, User, Store);
const Review = require('./review.model')(sequelize, User, Store);
const Thumb = require('./thumb.model')(sequelize, User, Review);

User.belongsToMany(Game, {through: Delegator, as: 'user_delegator_id'});
Game.belongsToMany(User, {through: Delegator, as: 'game_delegator_id'});

User.belongsToMany(Store, {through: Reciept, as: 'user_reciept_id'});
Store.belongsToMany(Store, {through: Reciept, as: 'store_reciept_id'});

User.belongsToMany(Store, {through: Review, as: 'user_review_id'});
Store.belongsToMany(User, {through: Review, as: 'store_review_id'});

User.belongsToMany(Review, {through: Thumb, as: 'user_thumb_id'});
Review.belongsToMany(User, {through: Thumb, as: 'review_thumb_id'});


const db = {};
db.sequelize = sequelize;


db.User = User;
db.Game = Game;
db.Delegator = Delegator;
db.Store = Store;
db.Receipt = Reciept;
db.Review = Review;
db.Thumb = Thumb;

module.exports = db;