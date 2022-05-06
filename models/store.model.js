const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const DataTypes = Sequelize.DataTypes;

const Store = (sequelize) => sequelize.define('Store',{
    store_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    store_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    store_xpos: {
        type: DataTypes.STRING,
        allowNull: false
    },
    store_ypos: {
        type: DataTypes.STRING,
        allowNull: false
    },
    store_address: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Store;