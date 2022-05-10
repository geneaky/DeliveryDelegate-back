const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Thumb = (sequelize, User, Review) => sequelize.define('Thumb', {
    thumb_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    review_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Review,
            key: 'review_id'
        }
    },
    thumb_up: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    thumb_down: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
});

module.exports = Thumb;