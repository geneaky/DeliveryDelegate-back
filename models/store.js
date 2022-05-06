const Sequelize = require('sequelize');

module.exports = class Store extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
        store_id: {  // 가게 연번
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true
            },

        location_name: {  // 매장 이름
            type: DataTypes.STRING(40),
            allowNull: false,
        },

        location_address : {  // 매장 주소
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true,
        },

        xpos: {  //매장 위치 x값
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        ypos: {  //매장 위치 y값
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
  static associate(db) {
    //hasMany : 현재 모델의 정보가 다른 모델로 들어갈 때
    db.Store.hasMany(db.Review,{foreignKey:'store_id',sourceKey:'store_id'});
}
};