const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Review = (sequelize, User, Store) => sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})

module.exports = Review;