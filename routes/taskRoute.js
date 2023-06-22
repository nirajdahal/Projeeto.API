const express = require("express")
const router = express.Router({ mergeParams: true });
const {
    protect,
    adminOnly,
    managerAndAdminOnlyly,
} = require("../middleware/authMiddleware")
const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTaskById,
    reorderTaskWithinStage,
    updateTaskToNewStage
} = require("../controllers/taskController")
router.get("/", protect, getAllTasks)
router.get("/:id", protect, getTaskById)
router.post("/", protect, createTask)
router.put("/:id", protect, updateTask)
router.put("/:id/newStage", protect, updateTaskToNewStage)
router.put("/:id/reorder", protect, reorderTaskWithinStage)
router.delete("/:id", protect, deleteTaskById)
module.exports = router
