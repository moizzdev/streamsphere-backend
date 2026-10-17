const express = require('express')
const app = express()
const cors = require('cors')
const userRoutes = require('./routes/userRoutes.cjs')
const productRoutes = require('./routes/productRoutes.cjs')
const chatRoutes = require("./routes/chatRoutes.cjs")
const orderRoutes = require('./routes/orderRoutes.cjs')
const cartRoutes = require('./routes/cartRoutes.cjs')
const adminRoutes = require('./routes/adminRoutes.cjs')
const dotenv = require('dotenv')
dotenv.config()

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }))
app.use(express.json())

app.use('/uploads', express.static('uploads'))
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/chats", chatRoutes)
app.use("/api/v1/orders", orderRoutes)
app.use("/api/v1/cart", cartRoutes)
app.use('/admin', adminRoutes)

module.exports = app