const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config.cjs')


const PRODUCT = sequelize.define("PRODUCTS",{
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: DataTypes.UUIDV1
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description : {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    coverImage : {
        type : DataTypes.STRING,
        allowNull : true
    },
    price: {
        type : DataTypes.FLOAT,
        allowNull: false,
    }
})

module.exports = PRODUCT