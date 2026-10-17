const express = require('express')
const cartRoutes = express.Router()
const authentication = require("../middleware/authenticationMiddleware.cjs")
const { addToCart, getMyCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController.cjs')

cartRoutes.post("/add", authentication, addToCart)
cartRoutes.get("/my-cart", authentication, getMyCart)
cartRoutes.patch("/:id", authentication, updateCartItem)
cartRoutes.delete("/:id", authentication, removeFromCart)
cartRoutes.delete("/", authentication, clearCart)

module.exports = cartRoutes