const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = class Delegator extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            delegator_id: {  // 달대표 연번
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
                },
            delegator_game_id:{  //(외래키)게임아이디
                type: DataTypes.INTEGER, 
                primaryKey: true, 
            },
            delegator_user_id :{ //(외래키) 사용자아이디
                type: DataTypes.INTEGER, 
                primaryKey: true, 
            },
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
        db.Delegator.belongsTo(db.User,{foreignKey:'delegator_user_id',targetKey:'user_id'});
        db.Delegator.belongsTo(db.Game,{foreignKey:'delegator_game_id',targetKey:'game_id'});
    }
}