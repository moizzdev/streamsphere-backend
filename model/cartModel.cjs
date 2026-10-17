const { DataTypes, UUIDV1 } = require('sequelize')
const sequelize = require('../config/db.config.cjs')

const CART_ITEM = sequelize.define("CART_ITEMS", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: UUIDV1
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
})

module.exports = CART_ITEM