const { ORDER, PRODUCT, USER } = require("../config/associations.cjs")

const createOrder = async (req, res) => {
    try {
        const buyerId = req.id
        const {
            productId, quantity, fullName, phone,
            addressLine, city, postalCode, country, paymentMethod
        } = req.body

        if (!productId || !fullName || !phone || !addressLine || !city || !country) {
            return res.status(400).json({ messege: "Please fill in all required fields" })
        }

        const product = await PRODUCT.findByPk(productId)
        if (!product) {
            return res.status(404).json({ messege: "Product not found" })
        }

        const qty = Number(quantity) || 1
        const totalPrice = product.price * qty

        const order = await ORDER.create({
            productId,
            buyerId,
            quantity: qty,
            totalPrice,
            fullName,
            phone,
            addressLine,
            city,
            postalCode,
            country,
            paymentMethod: paymentMethod === "card" ? "card" : "cod",
        })

        return res.status(201).json({
            messege: "Order placed successfully",
            data: order
        })
    } catch (error) {
        console.log(error, "Error in createOrder")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const getMyOrders = async (req, res) => {
    try {
        const buyerId = req.id
        const orders = await ORDER.findAll({
            where: { buyerId },
            order: [["createdAt", "DESC"]],
            include: [{ model: PRODUCT, attributes: ["id", "title", "coverImage", "price"] }]
        })
        return res.status(200).json({ messege: "Orders fetched", data: orders })
    } catch (error) {
        console.log(error, "Error in getMyOrders")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const getOrder = async (req, res) => {
    try {
        const { id } = req.params
        const order = await ORDER.findByPk(id, {
            include: [{ model: PRODUCT, attributes: ["id", "title", "coverImage", "price"] }]
        })
        if (!order) {
            return res.status(404).json({ messege: "Order not found" })
        }
        if (order.buyerId !== req.id) {
            return res.status(403).json({ messege: "You can't view someone else's order" })
        }
        return res.status(200).json({ messege: "Order found", data: order })
    } catch (error) {
        console.log(error, "Error in getOrder")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

module.exports = { createOrder, getMyOrders, getOrder }