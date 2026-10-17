const { CHAT, USER } = require("../config/associations.cjs")
const { Op } = require("sequelize")
const uploadToCloudinary = require('../middleware/uploadToCloudinary.cjs')

const sendMessage = async (req, res) => {
    try {
        const senderId = req.id
        const { receiverId, text } = req.body

        if (!receiverId) {
            return res.status(400).json({ messege: "Please provide receiverId" })
        }

        if (receiverId === senderId) {
            return res.status(400).json({ messege: "You cannot message yourself" })
        }

        // A message needs EITHER text or a file — not necessarily both.
        if (!text?.trim() && !req.file) {
            return res.status(400).json({ messege: "Please provide a message or an attachment" })
        }

        const receiver = await USER.findByPk(receiverId)
        if (!receiver) {
            return res.status(404).json({ messege: "Receiver not found" })
        }

        let attachmentUrl = null
        let attachmentType = null

        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'streamsphere/chat')
            attachmentUrl = result.secure_url
            if (req.file.mimetype.startsWith("audio/")) {
                attachmentType = "voice"
            } else if (req.file.mimetype.startsWith("image/")) {
                attachmentType = "image"
            } else {
                attachmentType = "document"
            }
        }

        const chat = await CHAT.create({
            senderId,
            receiverId,
            text: text || null,
            attachmentUrl,
            attachmentType,
        })

        return res.status(201).json({
            messege: "Message sent successfully",
            data: chat
        })
    } catch (error) {
        console.log(error, "Error in sendMessage")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const getConversation = async (req, res) => {
    try {
        const myId = req.id
        const { userId } = req.params

        if (!userId) {
            return res.status(400).json({ messege: "Please provide userId" })
        }

        const otherUser = await USER.findByPk(userId)
        if (!otherUser) {
            return res.status(404).json({ messege: "User not found" })
        }

        const messages = await CHAT.findAll({
            where: {
                [Op.or]: [
                    { senderId: myId, receiverId: userId },
                    { senderId: userId, receiverId: myId }
                ]
            },
            order: [["createdAt", "ASC"]],
            include: [
                { model: USER, as: "sender", attributes: ["id", "name"] },
                { model: USER, as: "receiver", attributes: ["id", "name"] }
            ]
        })

        return res.status(200).json({
            messege: "Conversation fetched",
            data: messages
        })
    } catch (error) {
        console.log(error, "Error in getConversation")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const getMyChats = async (req, res) => {
    try {
        const myId = req.id

        const messages = await CHAT.findAll({
            where: { [Op.or]: [{ senderId: myId }, { receiverId: myId }] },
            order: [["createdAt", "DESC"]],
            include: [
                { model: USER, as: "sender", attributes: ["id", "name", "avatar"] },
                { model: USER, as: "receiver", attributes: ["id", "name", "avatar"] }
            ]
        })

        // collapse into one entry per person you've chatted with, keeping the latest message
        const conversationsMap = {}
        messages.forEach((msg) => {
            const otherUser = msg.senderId === myId ? msg.receiver : msg.sender
            if (!conversationsMap[otherUser.id]) {
                conversationsMap[otherUser.id] = {
                    user: otherUser,
                    lastMessage: msg
                }
            }
        })

        return res.status(200).json({
            messege: "Chats fetched",
            data: Object.values(conversationsMap)
        })
    } catch (error) {
        console.log(error, "Error in getMyChats")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const markAsRead = async (req, res) => {
    try {
        const myId = req.id
        const { userId } = req.params

        await CHAT.update(
            { isRead: true },
            { where: { senderId: userId, receiverId: myId, isRead: false } }
        )

        return res.status(200).json({ messege: "Messages marked as read" })
    } catch (error) {
        console.log(error, "Error in markAsRead")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const deleteMessage = async (req, res) => {
    try {
        const myId = req.id
        const { id } = req.params

        const chat = await CHAT.findByPk(id)
        if (!chat) {
            return res.status(404).json({ messege: "Message not found" })
        }

        if (chat.senderId !== myId) {
            return res.status(403).json({ messege: "You can only delete your own messages" })
        }

        await chat.destroy()

        return res.status(200).json({
            messege: "Message deleted successfully",
            data: chat.id
        })
    } catch (error) {
        console.log(error, "Error in deleteMessage")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

// chatController.cjs
const reactToMessage = async (req, res) => {
    try {
        const myId = req.id
        const { id } = req.params   // message id
        const { emoji } = req.body

        if (!emoji) {
            return res.status(400).json({ messege: "Please provide an emoji" })
        }

        const chat = await CHAT.findByPk(id)
        if (!chat) {
            return res.status(404).json({ messege: "Message not found" })
        }

        // Only the sender or receiver of this specific message can react to it
        if (chat.senderId !== myId && chat.receiverId !== myId) {
            return res.status(403).json({ messege: "You can't react to this message" })
        }

        const currentReactions = chat.reactions || {}
        // Tapping the same emoji again removes it (toggle), like Instagram
        if (currentReactions[myId] === emoji) {
            delete currentReactions[myId]
        } else {
            currentReactions[myId] = emoji
        }

        chat.reactions = JSON.stringify(currentReactions)
        chat.changed('reactions', true) // needed so Sequelize detects the JSON mutation
        await chat.save()

        return res.status(200).json({ messege: "Reaction updated", data: chat })
    } catch (error) {
        console.log(error, "Error in reactToMessage")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

const getUnreadCounts = async (req, res) => {
    try {
        const myId = req.id

        const unreadMessages = await CHAT.findAll({
            where: { receiverId: myId, isRead: false },
            attributes: ["senderId"],
        })

        // Count how many unread messages came from each sender
        const counts = {}
        unreadMessages.forEach((msg) => {
            counts[msg.senderId] = (counts[msg.senderId] || 0) + 1
        })

        return res.status(200).json({
            messege: "Unread counts fetched",
            data: counts // { "<userId>": 3, "<userId2>": 1 }
        })
    } catch (error) {
        console.log(error, "Error in getUnreadCounts")
        return res.status(500).json({ messege: "Internal Server Error" })
    }
}

module.exports = { sendMessage, getConversation, getMyChats, markAsRead, deleteMessage, reactToMessage, getUnreadCounts }