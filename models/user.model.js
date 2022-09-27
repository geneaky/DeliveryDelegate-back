const Sequelize = require('sequelize');
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
    nickname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    self_posx: {
        type: DataTypes.STRING,
        allowNull: true
    },
    self_posy: {
        type: DataTypes.STRING,
        allowNull: true
    },
    coupon_count: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    penalty: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    penalty_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = User;
