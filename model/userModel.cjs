const { DataTypes, UUIDV1 } = require('sequelize')
const sequelize = require('../config/db.config.cjs')

const USER = sequelize.define("USER",{
    id: {
        type : DataTypes.UUID,
        primaryKey : true,
        unique: true,
        defaultValue : UUIDV1
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    name : {
        type : DataTypes.STRING,
        allowNull: false
    },
    password : {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    role : {
        type: DataTypes.ENUM("user", "streamer", "admin"),
        defaultValue:"user",
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
})

module.exports = USER