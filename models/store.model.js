const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = class Store extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
        store_id: {  // 가게 연번
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true
            },

        store_name: {  // 매장 이름
            type: DataTypes.STRING(20),
            allowNull: false,
        },

        store_address : {  // 매장 주소
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },

        store_xpos: {  //매장 위치 x값
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        store_ypos: {  //매장 위치 y값
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Store',
      tableName: 'stores',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
  //관계설정 1:N = Store : Review
  //관계설정 N:M = Store : User
  static associate(db) {
    db.Store.hasMany(db.Review,{foreignKey:'review_store_id',sourceKey:'store_id'});
    db.Store.belongsToMany(db.User, {through: 'reciept', foreignKey: 'reciept_store_id', sourceKey:'store_id'});
    }
};