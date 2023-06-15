const express = require("express")
const router = express.Router()
const stageRouter = require('./stageRoute')
// Re-route into other resource routers
router.use('/:projectId/stages', stageRouter)
const {
    protect,
    adminOnly,
    authorOnly,
} = require("../middleware/authMiddleware")
const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProjectById,
    getAllTeamProjects
} = require("../controllers/projectController")
router.get("/", protect, getAllProjects),
    router.get("/user", protect, getAllTeamProjects)
router.get("/:id", protect, getProjectById)
router.post("/", protect, createProject)
router.put("/:id", protect, updateProject)
router.delete("/:id", protect, deleteProjectById)
module.exports = router
