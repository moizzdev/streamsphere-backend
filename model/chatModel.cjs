const { DataTypes, UUIDV1 } = require("sequelize")
const sequelize = require("../config/db.config.cjs")

// model/chatModel.cjs
const CHAT = sequelize.define("CHAT", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: UUIDV1
    },
    text: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    reactions: {
        type: DataTypes.JSON,
        defaultValue: {},
    },
    attachmentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    attachmentType: {
        type: DataTypes.ENUM("image", "voice", "document"),
        allowNull: true,
    },
})

module.exports = CHAT