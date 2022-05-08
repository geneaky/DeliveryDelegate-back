const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = class Thumb extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            thumb_id: {  // 리뷰 연번
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
                },
            thumb_user_id : {  // (외래키)좋아요 작성자 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
            },
            thumb_review_id : {  // (외래키)리뷰 정보
                type: DataTypes.INTEGER, 
                primaryKey: true, 
            },
            thumb_up:{
                type: DataTypes.INTEGER, //원래는 TINYINT
                allowNull: false,
            },
            thumb_down:{
                type: DataTypes.INTEGER, //원래는 TINYINT
                allowNull: false,
            },
            
        },{
            sequelize,
            timestamps:false,
            modelName:'Thumb',
            tableName:'thumb',    //mySQL 테이블 명 들어가는 곳
            paranoid:false,
            cherset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
    //관계설정 1:N = Store : Review
    //관계설정 1:N = User : Review
    static associate(db){
        //belongsTo:현재 모델에서 다른 모델의 정보를 받아올 때 == 다른 모델의 정보가 들어갈 때
        db.Thumb.belongsTo(db.User,{foreignKey:'thumb_user_id',targetKey:'user_id'});
        db.Thumb.belongsTo(db.Review,{foreignKey:'thumb_review_id',targetKey:'review_id'});
    }
}