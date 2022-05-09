const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Delegator = (sequelize, User, Game) => sequelize.define('Delegator',{
    delegator_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    game_id: {
      type: DataTypes.INTEGER,
      references: {
          model: Game,
          key: 'game_id'
      }
    },
    ranking: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    }
});

module.exports = Delegator;