const PRODUCT = require("../model/productModel.cjs")
const USER = require("../model/userModel.cjs")
const CHAT = require("../model/chatModel.cjs")
const ORDER = require("../model/orderModel.cjs")
const CART_ITEM = require("../model/cartModel.cjs")

USER.hasMany(PRODUCT, { foreignKey: "userId" })
PRODUCT.belongsTo(USER, { foreignKey: "userId" })

USER.hasMany(CHAT, { as: "sentMessages", foreignKey: "senderId" })
USER.hasMany(CHAT, { as: "receivedMessages", foreignKey: "receiverId" })
CHAT.belongsTo(USER, { as: "sender", foreignKey: "senderId" })
CHAT.belongsTo(USER, { as: "receiver", foreignKey: "receiverId" })

ORDER.belongsTo(PRODUCT, { foreignKey: "productId" })
ORDER.belongsTo(USER, { as: "buyer", foreignKey: "buyerId" })
USER.hasMany(ORDER, { as: "orders", foreignKey: "buyerId" })

CART_ITEM.belongsTo(PRODUCT, { foreignKey: "productId" })
CART_ITEM.belongsTo(USER, { foreignKey: "userId" })
USER.hasMany(CART_ITEM, { as: "cartItems", foreignKey: "userId" })

module.exports = { USER, PRODUCT, CHAT, ORDER, CART_ITEM }