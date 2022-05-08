const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = class Review extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            reciept_id: {  // ?? 연번
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true
                },
            reciept_user_id : {  // (외래키)리뷰 작성자 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
            },
            reciept_store_id : {  // (외래키)가게 정보
                type: DataTypes.INTEGER, 
                primaryKey: true, 
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

    static associate(db){
        /// ..?
    }
}