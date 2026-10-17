const PRODUCT = require("../model/productModel.cjs");
const USER = require("../model/userModel.cjs");
const uploadToCloudinary = require('../middleware/uploadToCloudinary.cjs')


const getAllProducts = async (req,res) =>{

    try {
        let Products = await PRODUCT.findAll({
            include:[
                {
                    model: USER,
                    attributes: ["name","email"]
                }
            ]
        })

        console.log(Products,"GET ALL PRODUCTS");

        return res.status(200).json({
            messege: "Products Returned Succesfully",
            data: Products
        })

    } catch (error) {
        console.log(error,"error in product controller");
        return res.status(500).json({
            messege: "internal server error"
        })
    }

}


const getProduct = async (req, res) => {
    try {
        const { id } = req.params

        let product = await PRODUCT.findByPk(id, {
            include: [
                { model: USER, attributes: ["name"] }
            ]
        })

        if (!product) {
            return res.status(404).json({
                messege: "Product not found"
            })
        }

        return res.status(200).json({
            messege: "Product found successfully",
            data: product
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            messege: "internal server error"
        })
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, price } = req.body

        let product = await PRODUCT.findByPk(id)

        if (!product) {
            return res.status(404).json({
                messege: "product not found"
            })
        }

        if (product.userId !== req.id) {
            return res.status(400).json({
                messege: "Please update your own product"
            })
        }

        let coverImage = product.coverImage

        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'streamsphere/products')
            coverImage = result.secure_url
        }

        return res.status(200).json({
            messege: "product updated successfully",
            data: product
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            messege: "internal server error"
        })
    }
}


const delProduct = async (req,res) => {
    try {
        const {title, description, price} = req.body
        
        let product = await PRODUCT.findByPk(req.params.id)

        if(!product){
            return res.status(404).json({
                messege: "product not found"
            })
        }

        if (product.userId !== req.id){
            return res.status(400).json({
                messege: "Please delete you own Product"
            })
        }

        await product.destroy()

        return res.status(200).json({
            messege: "product updated succesfully",
            data: product.id
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            messege:"internal server error"
        })
    }
} 

module.exports = {getAllProducts,getProduct,updateProduct,delProduct}