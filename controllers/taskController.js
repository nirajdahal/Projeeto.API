const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const Stage = require('../models/stageModel');
const { postNotification } = require('./notificationController');
const User = require('../models/userModel');
// @desc    Create a new task
// @route   POST /projects/:projectId/stages/:stageId/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { name, description, priority, type, stage, assignees } = req.body;
    const task = new Task({ name, description, priority, type, stage, assignees, createdBy: req.user });
    await task.save();
    if (assignees) {
        for (const assignee of assignees) {
            const user = await User.findById(assignee);
            const notificationData = {
                user: user,
                updatedBy: req.user,
                message: `You have been assigned to new Task `,
                type: "ticket-added",
                read: "false",
                details: {
                    stageId: stage,
                    taskId: task._id
                }
            };
            await postNotification(notificationData);
        }
    }
    res.status(201).json({ success: true, data: task });
});
// @desc    Get all tasks
// @route   GET /projects/:projectId/stages/:stageId/tasks
// @access  Private
const getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find().populate('assignees');
    res.status(200).json({ success: true, data: tasks });
});
// @desc    Get a single task by ID
// @route   GET /projects/:projectId/stages/:stageId/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id).populate('assignees', '_id').lean();
    const assigneeIds = task.assignees.map(assignee => assignee._id);
    if (!task) {
        throw new ErrorResponse("Task not found with ID: ${req.params.id}", 404);
    }
    task.assignees = assigneeIds
    res.status(200).json({ success: true, data: task });
});
// @desc    Update an existing task
// @route   PUT /projects/:projectId/stages/:stageId/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const { name, description, priority, type, stage, assignees } = req.body;
    const task = await Task.findById(req.params.id).populate('assignees', '_id');
    if (!task) {
        throw new ErrorResponse("Task not found with ID: ${req.params.id}", 404);
    } else {
        task.name = name;
        task.description = description;
        task.priority = priority;
        task.type = type;
        task.stage = stage;
        task.assignees = assignees;
    }
    if (assignees && task.assignees) {
        const previousAssignees = task.assignees.map(assignee => assignee._id);
        const newAssignees = assignees.filter(userId => {
            if (!previousAssignees) {
                return true;
            }
            return !previousAssignees.includes(userId);
        })
        for (const assignee of newAssignees) {
            const user = await User.findById(assignee);
            const notificationData = {
                user: user,
                updatedBy: req.user,
                message: `You have been assigned to a Task `,
                type: "ticket-added",
                read: "false",
                details: {
                    stageId: stage,
                    taskId: task._id
                }
            };
            await postNotification(notificationData);
        }
    }
    //check if the assignee exist in previous task and save notification for only newly assigned users
    await task.save()
    const updatedTask = await Task.findById(task._id).populate('assignees', '_id').lean()
    let taskToReturn = updatedTask
    taskToReturn.assignees = updatedTask.assignees.map(assignee => assignee._id)
    res.status(200).json({ success: true, message: "Task updated succesfully", data: taskToReturn });
});
// @desc    Delete a task by ID
// @route   DELETE /projects/:projectId/stages/:stageId/tasks/:id
// @access  Private
const deleteTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
        throw new ErrorResponse("Task not found with ID: ${req.params.id}", 404);
    }
    res.status(200).json({ success: true, data: {} });
});
// @desc    Update a task to New Stage
// @route   UPDATE /projects/:projectId/stages/:stageId/tasks/:id/newStage
// @access  Private
const updateTaskToNewStage = asyncHandler(async (req, res) => {
    const { stageId, id } = req.params;
    const { toStageId, newOrder } = req.body;
    // Find the task that is being reordered
    const taskIdToUpdate = id
    // Reorder the task in both the original and new stages
    await reorderTaskBetweenStages(taskIdToUpdate, stageId, toStageId, newOrder);
    res.status(200).json({ success: true, message: "Reorderd task successful", data: {} });
});
// @desc    Reorder tasks 
// @route   UPDATE /projects/:projectId/stages/:stageId/tasks/:id/newStage
// @access  Private
const reorderTaskWithinStage = asyncHandler(async (req, res) => {
    const { stageId, id } = req.params;
    const { newPosition } = req.body;
    reorderTask(id, stageId, newPosition)
    res.status(200).json({ success: true, message: "Reorderd task successful", data: {} });
});
const reorderTask = async (taskIdToUpdate, stageId, newOrder,) => {
    // Find the task that is being updated
    const taskToUpdate = await Task.findById(taskIdToUpdate);
    // Get the original order of the task that is being updated
    const originalTaskOrder = taskToUpdate.order;
    // Find all tasks in the same stage as the updated task, and whose orders need to be adjusted
    const tasksToUpdate = await Task.find({
        stage: stageId,
        order: { $gte: Math.min(originalTaskOrder, newOrder) },
        _id: { $ne: taskIdToUpdate }
    });
    // Increment or decrement the order of each of those tasks by 1, depending on whether the task is moving up or down
    for (let i = 0; i < tasksToUpdate.length; i++) {
        const task = tasksToUpdate[i];
        if (newOrder > originalTaskOrder) {
            if (task.order > originalTaskOrder && task.order <= newOrder) {
                task.order -= 1;
            }
        } else {
            if (task.order >= newOrder && task.order < originalTaskOrder) {
                task.order += 1;
            }
        }
    }
    // Set the new order of the affected task
    taskToUpdate.order = newOrder;
    // Save all modified tasks to the database
    const updatePromises = tasksToUpdate.map((task) => task.save());
    updatePromises.push(taskToUpdate.save());
    await Promise.all(updatePromises);
}
const reorderTaskBetweenStages = async (taskId, originalStageId, newStageId, newOrder) => {
    try {
        const originalStage = await Stage.findById(originalStageId).populate('tasks');
        const newStage = await Stage.findById(newStageId).populate('tasks');
        const task = await Task.findById(taskId);
        // Remove task from original stage
        originalStage.tasks.splice(originalStage.tasks.indexOf(task._id), 1);
        // Update order of remaining tasks in original stage
        for (let i = task.order + 1; i < originalStage.tasks.length; i++) {
            const t = await Task.findById(originalStage.tasks[i]);
            if (t) {
                t.order--;
                await t.save();
            }
        }
        // Add task to new stage at specified position
        task.stage = newStage;
        task.order = newOrder;
        newStage.tasks.splice(newOrder, 0, task._id);
        // Update order of remaining tasks in new stage
        for (let i = newOrder + 1; i < newStage.tasks.length; i++) {
            const t = await Task.findById(newStage.tasks[i]);
            if (t) {
                t.order++;
                await t.save();
            }
        }
        await Promise.all([
            originalStage.save(),
            newStage.save(),
            task.save()
        ]);
        console.log(`Task order updated for task ${taskId}`);
    }
    catch (err) {
        console.log(err)
    }
}
module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTaskById,
    updateTaskToNewStage,
    reorderTaskWithinStage
};