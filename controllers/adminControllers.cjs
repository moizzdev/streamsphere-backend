const { USER, PRODUCT, ORDER, CHAT } = require("../config/associations.cjs")

const adminGetAllUsers = async (req, res) => {
    try {
        const users = await USER.findAll({
            attributes: ["id", "name", "email", "role", "avatar", "createdAt"]
        })
        return res.status(200).json({ messege: "Users fetched", data: users })
    } catch (error) {
        console.log(error, "Error in adminGetAllUsers")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const adminDeleteUser = async (req, res) => {
    try {
        const { id } = req.params
        if (id === req.id) {
            return res.status(400).json({ messege: "You can't delete your own admin account here" })
        }
        const deleted = await USER.destroy({ where: { id } })
        if (!deleted) {
            return res.status(404).json({ messege: "User not found" })
        }
        return res.status(200).json({ messege: "User deleted", data: id })
    } catch (error) {
        console.log(error, "Error in adminDeleteUser")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const adminSetUserRole = async (req, res) => {
    try {
        const { id } = req.params
        const { role } = req.body
        const allowed = ["user", "streamer", "admin"]

        if (!allowed.includes(role)) {
            return res.status(400).json({ messege: "Invalid role" })
        }

        const user = await USER.findByPk(id)
        if (!user) {
            return res.status(404).json({ messege: "User not found" })
        }

        await user.update({ role })
        return res.status(200).json({ messege: "Role updated", data: user })
    } catch (error) {
        console.log(error, "Error in adminSetUserRole")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const adminGetAllProducts = async (req, res) => {
    try {
        const products = await PRODUCT.findAll({
            include: [{ model: USER, attributes: ["name", "email"] }],
            order: [["createdAt", "DESC"]]
        })
        return res.status(200).json({ messege: "Products fetched", data: products })
    } catch (error) {
        console.log(error, "Error in adminGetAllProducts")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const adminDeleteProduct = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await PRODUCT.destroy({ where: { id } })
        if (!deleted) {
            return res.status(404).json({ messege: "Product not found" })
        }
        return res.status(200).json({ messege: "Product deleted", data: id })
    } catch (error) {
        console.log(error, "Error in adminDeleteProduct")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const adminGetAllOrders = async (req, res) => {
    try {
        const orders = await ORDER.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                { model: PRODUCT, attributes: ["id", "title", "coverImage", "price"] },
                { model: USER, attributes: ["id", "name", "email"] }
            ]
        })
        return res.status(200).json({ messege: "Orders fetched", data: orders })
    } catch (error) {
        console.log(error, "Error in adminGetAllOrders")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const adminGetStats = async (req, res) => {
    try {
        const [userCount, productCount, orderCount] = await Promise.all([
            USER.count(),
            PRODUCT.count(),
            ORDER.count(),
        ])
        return res.status(200).json({
            messege: "Stats fetched",
            data: { userCount, productCount, orderCount }
        })
    } catch (error) {
        console.log(error, "Error in adminGetStats")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

module.exports = {
    adminGetAllUsers, adminDeleteUser, adminSetUserRole,
    adminGetAllProducts, adminDeleteProduct,
    adminGetAllOrders, adminGetStats
}