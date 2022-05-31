const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Order = (sequelize) => sequelize.define('Order',{
    order_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    store_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mapx: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mapy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detail: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

module.exports = Order;