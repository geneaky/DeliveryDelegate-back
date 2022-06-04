const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Reciept = (sequelize) => sequelize.define('Reciept', {
    reciept_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }
});

module.exports = Reciept;