const express = require("express")
const taskRouter = require('./taskRoute')
// Re-route into other resource routers
const router = express.Router({ mergeParams: true });
router.use("/:stageId/tasks", taskRouter)
const {
    protect,
    adminOnly,
    authorOnly,
} = require("../middleware/authMiddleware")
const {
    createStage,
    getAllStages,
    getStageById,
    updateStage,
} = require("../controllers/stageController")
router.get("/", protect, getAllStages)
router.get("/:id", protect, getStageById)
router.post("/", protect, createStage)
router.put("/:id", protect, updateStage)
// router.delete("/:id", protect, deleteProjectById)
module.exports = router
