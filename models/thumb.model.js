const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Thumb = (sequelize) => sequelize.define('Thumb', {
    thumb_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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