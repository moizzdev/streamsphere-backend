

const authorization = (allowedRole)=>{

    return (req, res, next) => {
        try {
            let role = req.role

            if(!allowedRole.includes(role)){
                return res.status(400).json({
                    messege: "Unauthorized Role Request"
                })
            }

            next()
        } catch (error) {
            console.log(error, "Error In Authorization  Middleware");
            return res.status(500).json({
                messege: "Internal Server Error"
            })
        }
    }
}

module.exports = authorization