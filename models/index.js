const Sequelize = require('sequelize');
const User = require('./user'); 
const UUser = require('./user'); 
const Like = require('./like'); 
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
db.Like = Like;
db.Delegator = Delegator;
db.Game = Game;

// (async () => {
//     await sequelize.sync();   // call the sync before creating
//     const test = await User.create({
//       phone_number : '010',
//       name : 'yujini',
//       id : '00',
//       password : 'passwwww',
//       self_xpos : '127.12',
//       self_ypos : '37' 
//     });
//     console.log(jane.toJSON());
//   })();


module.exports = db;