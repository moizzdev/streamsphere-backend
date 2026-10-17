const express = require('express')
const { getAllProducts, getProduct, updateProduct, delProduct } = require('../controllers/productController.cjs')
const productRoutes = express.Router()
const upload = require("../middleware/uploadMiddleware.cjs")
const PRODUCT = require("../model/productModel.cjs")
const authentication = require("../middleware/authenticationMiddleware.cjs")
const authorization = require("../middleware/authorizationMiddleware.cjs")

    productRoutes.post("/create", authentication, authorization(['streamer', 'admin']), upload.single("coverImage"), async (req, res) => {

        try {
            const { title, description, price } = req.body;

            if (!title || !price) {
                return res.status(400).json({ messege: "Please provide a title and price" });
            }

            const imageUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

            const product = await PRODUCT.create({
                title,
                description,
                price,
                coverImage: imageUrl,
                userId: req.id,
            });

            return res.status(201).json({
                messege: "Product Created!",
                data: product
            })
        } catch (error) {
            console.log(error, "Error in create product route");
            return res.status(500).json({
                messege: "Internal Server Error",
            })
        }

    })
    productRoutes.get("/",getAllProducts)
    productRoutes.get("/:id",getProduct)
    productRoutes.patch("/:id", authentication, upload.single("coverImage"), updateProduct)
    productRoutes.delete("/:id", authentication, delProduct)

module.exports = productRoutes