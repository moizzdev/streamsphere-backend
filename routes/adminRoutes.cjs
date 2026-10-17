const express = require('express')
const adminRoutes = express.Router()
const authentication = require("../middleware/authenticationMiddleware.cjs")
const authorization = require("../middleware/authorizationMiddleware.cjs")
const {
    adminGetAllUsers, adminDeleteUser, adminSetUserRole,
    adminGetAllProducts, adminDeleteProduct,
    adminGetAllOrders, adminGetStats
} = require('../controllers/adminControllers.cjs')

    adminRoutes.use(authentication, authorization(['admin']))
    
    adminRoutes.get("/stats", adminGetStats)
    
    adminRoutes.get("/users", adminGetAllUsers)
    adminRoutes.patch("/users/:id/role", adminSetUserRole)
    adminRoutes.delete("/users/:id", adminDeleteUser)
    
    adminRoutes.get("/products", adminGetAllProducts)
    adminRoutes.delete("/products/:id", adminDeleteProduct)
    
    adminRoutes.get("/orders", adminGetAllOrders)

module.exports = adminRoutes