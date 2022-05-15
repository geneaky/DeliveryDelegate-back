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

User.belongsToMany(Game, {through: Delegator});
Game.belongsToMany(User, {through: Delegator});

User.belongsToMany(Store, {through: Review});
Store.belongsToMany(User, {through: Review});

Reciept.hasOne(Review);

User.belongsToMany(Review, {through: Thumb});
Review.belongsToMany(User, {through: Thumb});

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