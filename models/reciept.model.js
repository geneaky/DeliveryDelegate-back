const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Reciept = (sequelize, User, Store) => sequelize.define('Reciept', {
    reciept_id: {
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
    store_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Store,
            key: 'store_id'
        }
    }
});

module.exports = Reciept;