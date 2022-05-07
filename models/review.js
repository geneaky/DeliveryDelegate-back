const Sequelize = require('sequelize');

module.exports = class Review extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            review_id: {  // 리뷰 연번
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
                },

             /* user_id : (외래키)리뷰 작성자   
                store_id : (외래키)가게 정보 */

            content:{  // 리뷰 내용
                // type:DataTypes.TEXT, mysql 작동 안됨
                type:DataTypes.STRING(1000),
                allowNull:false,
            },
            created_at:{  // 리뷰 작성 시간
                type:DataTypes.DATE,
                allowNull:true,
                defaultValue:Sequelize.NOW,
            },
        },{
            sequelize,
            timestamps:false,
            modelName:'Review',
            tableName:'reviews',    //mySQL 테이블 명 들어가는 곳
            paranoid:false,
            cherset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
    //관계설정 1:N = Store : Review
    //관계설정 1:N = User : Review
    //관계설정 1:N = Review : like
    static associate(db){
        //belongsTo:현재 모델에서 다른 모델의 정보를 받아올 때 == 다른 모델의 정보가 들어갈 때
        db.Review.belongsTo(db.User, {foreignKey:'user_id',targetKey:'user_id'});
        db.Review.belongsTo(db.Store, {foreignKey:'store_id',targetKey:'store_id'});
        db.Review.hasMany(db.Like, {foreignKey:'review_id',sourceKey:'review_id'});
    }
}