const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
        user_id: {  // 사용자 연번
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true
            },
        phone_number: { // 주민번호 대신 본인확인용으로 전화번호
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        password: {  // 비밀번호
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        self_xpos: {  //현재 위치 x값
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        self_ypos: {  //현재 위치 y값
            type: DataTypes.STRING(10),
            allowNull: false,
        },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
  //관계설정 1:N = User : Delegator
  //관계설정 1:N = User : Review
  //관계설정 1:N = User : Thumb
  //관계설정 N:M = Store : User
  static associate(db) {
    db.User.hasMany(db.Delegator,{foreignKey:'delegator_user_id',sourceKey:'user_id'});
    db.User.hasMany(db.Review,{foreignKey:'review_user_id',sourceKey:'user_id'});
    db.User.hasMany(db.Thumb,{foreignKey:'thumb_user_id',sourceKey:'user_id'});
    db.User.belongsToMany(db.Store, {through: 'reciept', foreignKey: 'user_id', otherKey: 'reciept_user_id'});
}
};