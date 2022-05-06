const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const DataTypes = Sequelize.DataTypes;

const User = (sequelize) => sequelize.define('User',{
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    self_xpos: {
        type: DataTypes.STRING,
        allowNull: true
    },
    self_ypos: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = User;

