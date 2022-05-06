const Sequelize = require('sequelize');

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
        name: {  // 사용자 이름
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        id: {  // ?? 일단 만들
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true,
        },
        password: {  // 비밀번호
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        self_xpos: {  //현재 위치 x값
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        self_ypos: {  //현재 위치 y값
            type: DataTypes.STRING(20),
            allowNull: true,
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
  static associate(db) {
    //hasMany : 현재 모델의 정보가 다른 모델로 들어갈 때
    db.User.hasMany(db.Delegator,{foreignKey:'user_id',sourceKey:'user_id'});
}
};