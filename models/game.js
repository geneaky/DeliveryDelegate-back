const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = class Game extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
        game_id: {  // 게임방 연번
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true
            },
        game_type: { // 게임방 타입?
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        game_name: { // 게임방 이름
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: false,
        },
        population: { // 인원??
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        landmark_xpos: {  // 랜드마크 x값
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        landmark_ypos: {  // 랜드마크 y값
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Game',
      tableName: 'games',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
  //관계설정 1:N = Game : Delegator
  static associate(db) {
    //hasMany : 현재 모델의 정보가 다른 모델로 들어갈 때
    db.Game.hasMany(db.Delegator,{foreignKey:'game_id',sourceKey:'game_id'});
}
};