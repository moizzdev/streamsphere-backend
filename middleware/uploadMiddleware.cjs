const multer = require("multer")
    
    let storage = multer.memoryStorage()

    let fileFilter = (req, file, callback)=>{
        const allowedTypes = [
            "image/",
            "audio/",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument",
            "text/plain",
        ]
    
        const isAllowed = allowedTypes.some((type) => file.mimetype.startsWith(type))
    
        if(isAllowed){
            callback(null, true)
        }
        else{
            callback(new Error("This file type isn't supported"), false)
        }
    }

    let upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })



    module.exports = upload