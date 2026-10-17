const cloudinary = require('../middleware/cloudinary.cjs')

const uploadToCloudinary = (file, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (err, result) => {
                if (err) return reject(err)
                resolve(result)
            }
        )
        stream.end(file.buffer)
    })
}

module.exports = uploadToCloudinary