const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = class Review extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            review_id: {  // 리뷰 연번
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
                },
            review_user_id : {  // (외래키)리뷰 작성자 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
            },
            review_store_id : {  // (외래키)가게 정보
                type: DataTypes.INTEGER, 
                primaryKey: true, 
            },
            content:{  // 리뷰 내용
                type:DataTypes.TEXT,
                allowNull:false,
            },
            /*created_at:{  // 리뷰 작성 시간
                type:DataTypes.DATE,
                allowNull:true,
                defaultValue:Sequelize.NOW,
            },*/
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
    //관계설정 1:N = Review : Thumb
    static associate(db){
        db.Review.belongsTo(db.User, {foreignKey:'review_user_id',targetKey:'user_id'});
        db.Review.belongsTo(db.Store, {foreignKey:'review_store_id',targetKey:'store_id'});
        db.Review.hasMany(db.Thumb, {foreignKey:'thumb_review_id',sourceKey:'review_id'});
    }
}