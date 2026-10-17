const { CART_ITEM, PRODUCT } = require("../config/associations.cjs")

const addToCart = async (req, res) => {
    try {
        const userId = req.id
        const { productId, quantity } = req.body

        if (!productId) {
            return res.status(400).json({ messege: "Please provide a product" })
        }

        const product = await PRODUCT.findByPk(productId)
        if (!product) {
            return res.status(404).json({ messege: "Product not found" })
        }

        // If this product is already in the cart, just bump the quantity
        // instead of creating a duplicate row.
        let existing = await CART_ITEM.findOne({ where: { userId, productId } })

        if (existing) {
            existing.quantity += Number(quantity) || 1
            await existing.save()
            return res.status(200).json({ messege: "Cart updated", data: existing })
        }

        const item = await CART_ITEM.create({
            userId,
            productId,
            quantity: Number(quantity) || 1,
        })

        return res.status(201).json({ messege: "Added to cart", data: item })
    } catch (error) {
        console.log(error, "Error in addToCart")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const getMyCart = async (req, res) => {
    try {
        const userId = req.id
        const items = await CART_ITEM.findAll({
            where: { userId },
            include: [{ model: PRODUCT, attributes: ["id", "title", "coverImage", "price", "userId"] }],
            order: [["createdAt", "DESC"]],
        })
        return res.status(200).json({ messege: "Cart fetched", data: items })
    } catch (error) {
        console.log(error, "Error in getMyCart")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const updateCartItem = async (req, res) => {
    try {
        const userId = req.id
        const { id } = req.params
        const { quantity } = req.body

        const item = await CART_ITEM.findByPk(id)
        if (!item) {
            return res.status(404).json({ messege: "Cart item not found" })
        }
        if (item.userId !== userId) {
            return res.status(403).json({ messege: "You can't edit someone else's cart" })
        }

        if (Number(quantity) < 1) {
            return res.status(400).json({ messege: "Quantity must be at least 1" })
        }

        item.quantity = Number(quantity)
        await item.save()

        return res.status(200).json({ messege: "Cart item updated", data: item })
    } catch (error) {
        console.log(error, "Error in updateCartItem")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const removeFromCart = async (req, res) => {
    try {
        const userId = req.id
        const { id } = req.params

        const item = await CART_ITEM.findByPk(id)
        if (!item) {
            return res.status(404).json({ messege: "Cart item not found" })
        }
        if (item.userId !== userId) {
            return res.status(403).json({ messege: "You can't remove someone else's cart item" })
        }

        await item.destroy()

        return res.status(200).json({ messege: "Removed from cart", data: id })
    } catch (error) {
        console.log(error, "Error in removeFromCart")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const clearCart = async (req, res) => {
    try {
        const userId = req.id
        await CART_ITEM.destroy({ where: { userId } })
        return res.status(200).json({ messege: "Cart cleared" })
    } catch (error) {
        console.log(error, "Error in clearCart")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

module.exports = { addToCart, getMyCart, updateCartItem, removeFromCart, clearCart }