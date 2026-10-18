const Task = require("../models/task.model");
const { HTTP_STATUS } = require("../utils/constants");
const ApiError = require("../utils/apiError");

// Create - أي يوزر يعمل تاسك لنفسه
const createTask = async (req, res, next) => {
  const task = await Task.create({
    ...req.body,
    user: req.user.id,
  });
  res.status(HTTP_STATUS.CREATED).json(task);
};

// Get My Tasks - مع pagination, filtering, validation زي ما في الصورة
// GET /api/tasks?page=1&limit=10&completed=false&search=meeting
const getMyTasks = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filtering
  let filter = { user: req.user.id };

  if (req.query.completed) {
    filter.completed = req.query.completed === "true";
  }

  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: "i" };
  }

  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Task.countDocuments(filter);

  res.json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

// Get Single - لازم يكون بتاعه هو
const getTask = async (req, res, next) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) return next(new ApiError("Task not found", HTTP_STATUS.NOT_FOUND));
  res.json(task);
};

const updateTask = async (req, res, next) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true },
  );
  if (!task) return next(new ApiError("Task not found", HTTP_STATUS.NOT_FOUND));
  res.json(task);
};

const deleteTask = async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!task) return next(new ApiError("Task not found", HTTP_STATUS.NOT_FOUND));
  res.json({ message: "Deleted" });
};

// للـ Admin بس
const getAllTasksAdmin = async (req, res, next) => {
  const tasks = await Task.find().populate("user", "name email");
  res.json(tasks);
};

module.exports = {
  createTask,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
  getAllTasksAdmin,
};
