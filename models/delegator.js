const Sequelize = require('sequelize');

module.exports = class Delegator extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            delegator_id: {  // 달대표 연번
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
                },
            /*
            game_id:{
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
            },
             user_id : 외래키로 받아옴 */
            ranking: {
                type: DataTypes.INTEGER, 
                allowNull: false,
                },
            },
        {
            sequelize,
            timestamps:false,
            modelName:'Delegator',
            tableName:'delegators',    //mySQL 테이블 명 들어가는 곳
            paranoid:false,
            cherset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
    //관계설정 1:N = User : Delegator
    //관계설정 1:N = Game : Delegator
    static associate(db){
        //belongsTo:현재 모델에서 다른 모델의 정보를 받아올 때 == 다른 모델의 정보가 들어갈 때
        db.Delegator.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
        db.Delegator.belongsTo(db.Game,{foreignKey:'game_id',targetKey:'game_id'});
    }
}