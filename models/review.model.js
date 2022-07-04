const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const Review = (sequelize) => sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_path:{
        type: DataTypes.TEXT,
        allowNull: true
    }

})

module.exports = Review;