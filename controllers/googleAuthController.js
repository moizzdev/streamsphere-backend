const USER = require('../model/userModel.cjs')
const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client("83371585750-bfi59g3li08msnfri607fqovm2m72dko.apps.googleusercontent.com")

const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body

        if (!credential) {
            return res.status(400).json({ messege: "No Google credential provided" })
        }
        
        // Verifies the token was genuinely issued by Google for YOUR
        // client id, and decodes the user's verified email/name from it.
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: "83371585750-bfi59g3li08msnfri607fqovm2m72dko.apps.googleusercontent.com",
        })
        const payload = ticket.getPayload()
        const { email, name, picture } = payload

        let user = await USER.findOne({ where: { email } })

        if (!user) {
            // Sign up: no account with this email yet — create one.
            // Google-authenticated users don't need a local password,
            // so we store a random unusable hash as a placeholder
            // (they'll always log in via Google, never via this hash).
            const randomPassword = await bycrypt.hash(email + Date.now() + Math.random(), 10)
            user = await USER.create({
                name,
                email,
                password: randomPassword,
                avatar: picture || null,
            })
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            "8dF#vL2@qX9!nR5$zK1^Wp7&Me3*Yt0!Hs6%Bc8@Jf4#Lm9",
            { expiresIn: "5d" }
        )

        return res.status(200).json({
            messege: "Signed in with Google",
            data: {
                token,
                user,
            }
        })
    } catch (error) {
        console.log(error, "Error in googleAuth")
        return res.status(500).json({
            messege: "Google sign-in failed"
        })
    }
}

module.exports = { googleAuth }