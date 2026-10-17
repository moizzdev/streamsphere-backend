const express = require('express')
const chatRoutes = express.Router()
const authentication = require("../middleware/authenticationMiddleware.cjs")
const { sendMessage, getConversation, getMyChats, markAsRead, deleteMessage, reactToMessage ,getUnreadCounts} = require('../controllers/chatController.cjs')
const upload = require("../middleware/uploadMiddleware.cjs")

chatRoutes.post("/send", authentication, upload.single("attachment"), sendMessage)
chatRoutes.get("/unread-counts", authentication, getUnreadCounts)
chatRoutes.get("/my-chats", authentication, getMyChats)
chatRoutes.get("/:userId", authentication, getConversation)
chatRoutes.patch("/read/:userId", authentication, markAsRead)
chatRoutes.delete("/:id", authentication, deleteMessage)
chatRoutes.post("/react/:id", authentication, reactToMessage)

module.exports = chatRoutes