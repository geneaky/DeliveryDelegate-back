const Sequelize = require('sequelize');

module.exports = class Like extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            like_id: {  // 리뷰 연번
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
                },
             /* user_id : (외래키)좋아요 작성자   
                review_id : (외래키)리뷰 정보 */
        },{
            sequelize,
            timestamps:false,
            modelName:'Like',
            tableName:'likes',    //mySQL 테이블 명 들어가는 곳
            paranoid:false,
            cherset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
    //관계설정 1:N = Store : Review
    //관계설정 1:N = User : Review
    static associate(db){
        //belongsTo:현재 모델에서 다른 모델의 정보를 받아올 때 == 다른 모델의 정보가 들어갈 때
        db.Like.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
        db.Like.belongsTo(db.Review,{foreignKey:'review_id',targetKey:'review_id'});
    }
}