const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Delegator = (sequelize) => sequelize.define('Delegator',{
    delegator_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ranking: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
    }
});

module.exports = Delegator;