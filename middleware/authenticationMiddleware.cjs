const jwt = require('jsonwebtoken')
const USER = require('../model/userModel.cjs')

const authentication = async (req, res, next) => {
    try {
        const token = req.headers.authorization || req.headers.Authorization

        if (!token) {
            return res.status(400).json({ messege: "Please Provide Token to Proceed" })
        }

        let splitToken = token.split(" ")[1]
        let verifyToken

        try {
            verifyToken = jwt.verify(splitToken, "8dF#vL2@qX9!nR5$zK1^Wp7&Me3*Yt0!Hs6%Bc8@Jf4#Lm9")
        } catch (error) {
            console.log(error)
            return res.status(400).json({ messege: "Token Verification Failed." })
        }

        let user = await USER.findOne({ where: { id: verifyToken.id } })

        if (!user) {
            return res.status(404).json({ messege: "User not found" })
        }

        req.id = verifyToken.id
        req.role = verifyToken.role

        next()
    } catch (error) {
        console.log(error, "Error in Authentication Middleware")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

module.exports = authentication