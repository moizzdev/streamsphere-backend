const express = require('express')
const orderRoutes = express.Router()
const authentication = require("../middleware/authenticationMiddleware.cjs")
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController.cjs')

orderRoutes.post("/create", authentication, createOrder)
orderRoutes.get("/my-orders", authentication, getMyOrders)
orderRoutes.get("/:id", authentication, getOrder)

module.exports = orderRoutes