const { DataTypes, UUIDV1 } = require('sequelize')
const sequelize = require('../config/db.config.cjs')

const ORDER = sequelize.define("ORDERS", {
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
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fullName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    addressLine: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    postalCode: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: false },
    paymentMethod: {
        type: DataTypes.ENUM("cod", "card"),
        allowNull: false,
        defaultValue: "cod",
    },
    status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
        allowNull: false,
        defaultValue: "confirmed",
    },
})

module.exports = ORDER