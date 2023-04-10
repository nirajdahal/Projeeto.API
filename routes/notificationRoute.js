const express = require("express")
const router = express.Router()
const {
    protect,
    adminOnly,
    authorOnly,
} = require("../middleware/authMiddleware")
const {
    getNotifications,
    readNotifications
} = require("../controllers/notificationController")
router.get("/seen", protect, readNotifications)
router.get("/:id", protect, getNotifications)
module.exports = router
