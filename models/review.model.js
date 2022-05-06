const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Review = (sequelize, User, Store) => sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    store_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Store,
            key: 'store_id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})

module.exports = Review;