const Sequelize = require('sequelize');
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
    store_posx: {
        type: DataTypes.STRING,
        allowNull: false
    },
    store_posy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    store_address: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Store;