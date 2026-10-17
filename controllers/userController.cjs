const USER = require('../model/userModel.cjs')
const validater = require('validator')
const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { OAuth2Client } = require('google-auth-library')
const uploadToCloudinary = require('../middleware/uploadToCloudinary.cjs')
const dotenv = require('dotenv')
dotenv.config()


const googleClient = new OAuth2Client("83371585750-bfi59g3li08msnfri607fqovm2m72dko.apps.googleusercontent.com")

const searchUsers = async (req, res) => {
    try {
        const { query } = req.query
        const myId = req.id

        if (!query || query.trim() === "") {
            return res.status(200).json({ messege: "No query provided", data: [] })
        }

        const users = await USER.findAll({
            where: {
                name: { [Op.like]: `%${query}%` },
                id: { [Op.ne]: myId } // exclude yourself from results
            },
            attributes: ["id", "name", "email", "role", "avatar"] // never return password
        })

        return res.status(200).json({
            messege: "Users found",
            data: users
        })
    } catch (error) {
        console.log(error, "Error in searchUsers")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const register = async (req, res) => {
    try {
        const {name , email, password} = req.body

        if(!name || !email || !password){
            return res.status(500).json({
                messege: "please provide full data"
            })
        }

        const checkEmail = validater.isEmail(email)

        if(!checkEmail){
            console.log("email is incorrect");
            return res.status(400).json({
                messege: "please provide correct email"
            })
        }

        const checkPassword = validater.isStrongPassword(password)

        if(!checkPassword){
            console.log("password is not strong");
            return res.status(500).json({
                messege: "please provide strong password"
            })
        }



        let checkUser = await USER.findOne({
            where: {
                email: email,
            },
        });
        console.log(checkUser,"DATA FROM DB");

        if(checkUser) {
            return res.status(400).json({
                messege: "User already exists"
            })
        }

        let salt = await bycrypt.genSalt(10)
        let hashedPassword = await bycrypt.hash(password,salt)

        let user = await USER.create({
            name: name,
            email: email,
            password: hashedPassword,
        })

        console.log(user, "user");

        return res.status(201).json({
            messege : "User created successfully"
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            messege: "internal server error"
        })
    }
}

const login = async (req,res) => {

    try {

        const {email , password} = req.body

        if(!email || !password) {
            return res.status(400).json({
                messege: "please enter email and password"
            })
        }

        let userExist = await USER.findOne({
            where: {
                email: email
            }
        })

        if(!userExist) {
            return res.status(404).json({
                messege: "User not found"
            })
        }

        let comparePassword = await bycrypt.compare(password, userExist.password)

        if(!comparePassword){
            return res.status(400).json({
                messege: "Incorrect Password"
            })
        }

        const token = jwt.sign(
            { id: userExist.id, role: userExist.role },
            process.env.JSON_SECRET_KEY,
            { expiresIn: "5d" }
        )

        return res.status(200).json({
            messege : "User Logged In",
            data: {
                token,
                user: {
                    id: userExist.id,
                    name: userExist.name,
                    email: userExist.email,
                    role: userExist.role,
                    avatar: userExist.avatar,
                }
            }
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            messege: "internal server error"
        })
        
    }
}

const getAllUsers = async (req , res) => {
    try {
        let getUsers = await USER.findAll({ attributes: ["id", "name", "email", "role", "avatar"] })

        console.log(getUsers , "GET USERS");

        return res.status(200).json({
            messege: "succesfilly got users",
            data : getUsers
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json()
    }
}

const getUser = async (req,res) => {
    try {
        let { id } = req.params;

        if(!id) {
            return res.status(400).json({
                messege: "Provide full data"
            })
        }

        let checkUser = await USER.findOne({
            where: { id },
            attributes: ["id", "name", "role", "avatar"]
        })

        if(!checkUser) {
            return res.status(404).json({
                messege: "User not found"
            })
        }

        return res.status(200).json({
            messege: "User returned",
            data: checkUser        
        })
    } catch (error) {
        return res.status(500).json({
            messege: "Internal server error"
        })
    }
}

const getMe = async (req,res) => {
    try {

        let myData = await USER.findByPk(req.id)

        if(!myData) {
            return res.status(404).json({
                messege: "User not found"
            })
        }
        
       return res.status(200).json({
        messege: "user returned",
        data: {
        id: myData.id,
        name: myData.name,
        email: myData.email,
        role: myData.role,
        avatar: myData.avatar,  
    }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            messege: "Internal server error"
        })
    }
}

const updateUser = async (req, res) => {
    try {

        const { name, email } = req.body

        let checkUser = await USER.findByPk(req.id)

        if (!checkUser) {
            return res.status(404).json({
                messege: "User does not exist"
            })
        }

        let avatar = checkUser.avatar

        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'streamsphere/avatars')
            avatar = result.secure_url
        }
        
        await checkUser.update({
            name: name || checkUser.name,
            email: email || checkUser.email,
            avatar,
        })

        return res.status(200).json({
            messege: "User Updated",
            data: {
                id: checkUser.id,
                name: checkUser.name,
                email: checkUser.email,
                role: checkUser.role,
                avatar: checkUser.avatar,
            }
        })
    } catch (error) {
        console.log(error, "Error in updateUser")
        return res.status(500).json({
            messege: "Internal Server Error"
        })
    }
}

const deleteUser = async (req , res) => {
    try {
        let deletedUser = await USER.destroy({
            where : {
                id: req.id
            }
        })

        return res.status(200).json({
            messege : "User Deleted successfully",
            data : deletedUser.id,
        })
    } catch (error) {
        return res.status(200).json({
            messege: "Internal server error",
        })        
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ messege: "Please provide your current and new password" })
        }

        const checkPassword = validater.isStrongPassword(newPassword)
        if (!checkPassword) {
            return res.status(400).json({ messege: "New password must be strong (uppercase, lowercase, number, symbol, 8+ chars)" })
        }

        let user = await USER.findByPk(req.id)
        if (!user) {
            return res.status(404).json({ messege: "User not found" })
        }

        const isMatch = await bycrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({ messege: "Current password is incorrect" })
        }

        const salt = await bycrypt.genSalt(10)
        const hashedPassword = await bycrypt.hash(newPassword, salt)

        await user.update({ password: hashedPassword })

        return res.status(200).json({
            messege: "Password updated successfully"
        })
    } catch (error) {
        console.log(error, "Error in changePassword")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const becomeStreamer = async (req, res) => {
    try {
        const user = await USER.findByPk(req.id)

        if (!user) {
            return res.status(404).json({ messege: "User not found" })
        }

        if (user.role === "streamer" || user.role === "admin") {
            return res.status(400).json({ messege: "You're already able to sell products" })
        }

        await user.update({ role: "streamer" })
        
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JSON_SECRET_KEY,
            { expiresIn: "5d" }
        )
        
        return res.status(200).json({
            messege: "You're now a streamer! You can add products.",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                }
            }
        })
    } catch (error) {
        console.log(error, "Error in becomeStreamer")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

module.exports = { getAllUsers, getUser , register ,login, updateUser, deleteUser ,getMe , searchUsers, changePassword, becomeStreamer};