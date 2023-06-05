const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../middleware/errorMiddleware')
const Project = require('../models/projectModel')
// @desc    Create a new project
// @route   POST /projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const { name, description, manager } = req.body;
    const project = new Project({ name, description, manager });
    await project.save();
    res.status(201).json({ success: true, data: project });
});
// @desc    Get all projects
// @route   GET /projects
// @access  Private
const getAllProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find().populate('managers');
    res.status(200).json({ success: true, data: projects });
});
// @desc    Get a single project by ID
// @route   GET /projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).populate('managers');
    if (!project) {
        throw new ErrorResponse(`Project not found with ID: ${req.params.id}`, 404);
    }
    res.status(200).json({ success: true, data: project });
});
// @desc    Update an existing project
// @route   PUT /projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
    const { name, description, managers } = req.body;
    const project = await Project.findByIdAndUpdate(
        req.params.id,
        { $set: { name, description, managers } },
        { new: true }
    );
    if (!project) {
        throw new ErrorResponse(`Project not found with ID: ${req.params.id}`, 404);
    }
    res.status(200).json({ success: true, data: project });
});
// @desc    Delete a project by ID
// @route   DELETE /projects/:id
// @access  Private
const deleteProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
        throw new ErrorResponse(`Project not found with ID: ${req.params.id}`, 404);
    }
    res.status(200).json({ success: true, data: {} });
});
module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProjectById
};