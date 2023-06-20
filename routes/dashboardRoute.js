const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/authMiddleware")
const { getTaskPriority, getTaskType, getProjectWithManagerType, getProjectTaskAndUserCount } = require("../controllers/dashboardController")
router.get("/priority", protect, getTaskPriority),
    router.get("/type", protect, getTaskType),
    router.get("/project", protect, getProjectWithManagerType),
    router.get("/count", protect, getProjectTaskAndUserCount),
    // router.get("/:id", protect, getProjectById)
    module.exports = router