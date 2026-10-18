const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { HTTP_STATUS } = require("../utils/constants");
const ApiError = require("../utils/apiError");
const Task = require("../models/task.model");

// @desc Get my profile
// GET /api/users/me
const getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    "-password -refreshToken",
  );
  res.json(user);
};

// @desc Update my profile (name, email only)
// PATCH /api/users/me
const updateMe = async (req, res, next) => {
  const { name, email } = req.body;

  if (email) {
    const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exists)
      return next(
        new ApiError("Email already exists", HTTP_STATUS.BAD_REQUEST),
      );
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  res.json(user);
};

// @desc Update password
// PATCH /api/users/update-password
const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  const valid = bcrypt.compare(currentPassword);
  if (!valid)
    return next(
      new ApiError("Current password wrong", HTTP_STATUS.BAD_REQUEST),
    );

  user.password = await bcrypt.hash(newPassword, 10);
  user.refreshToken = null; // يطرده من كل الأجهزة
  await user.save();

  res.json({ message: "Password updated, please login again" });
};

// ===== ADMIN ONLY =====

// @desc Get all users with pagination + filtering
// GET /api/users?page=1&limit=10&role=USER&search=mohamed
const getAllUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken",
  );
  if (!user) return next(new ApiError("User not found", HTTP_STATUS.NOT_FOUND));
  res.json(user);
};

// PATCH /api/users/:id/role - تغيير رول يوزر
const updateUserRole = async (req, res, next) => {
  const { role } = req.body; // USER or ADMIN
  if (!["USER", "ADMIN"].includes(role)) {
    return next(new ApiError("Invalid role", HTTP_STATUS.BAD_REQUEST));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
  ).select("-password -refreshToken");

  if (!user) return next(new ApiError("User not found", HTTP_STATUS.NOT_FOUND));
  res.json(user);
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new ApiError("User not found", HTTP_STATUS.NOT_FOUND));

  // امسح كل التاسكات بتاعته كمان
  await Task.deleteMany({ user: req.params.id });

  res.json({ message: "User and his tasks deleted" });
};

// @desc Admin create new user with specific role
// POST /api/users
// Body: { name, email, password, role: "USER" | "ADMIN" }
const adminCreateUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // 1. validation
  if (!name || !email || !password) {
    return next(
      new ApiError(
        "name, email, password are required",
        HTTP_STATUS.BAD_REQUEST,
      ),
    );
  }

  // 2. Check if email already exists
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return next(new ApiError("Email already exists", HTTP_STATUS.BAD_REQUEST));
  }

  // 3. if sent role is valid, use it, else default to USER
  const finalRole = role && ["USER", "ADMIN"].includes(role) ? role : "USER";

  // 5. Create
  const user = await User.create({
    name,
    email,
    password,
    role: finalRole,
  });

  res.status(HTTP_STATUS.CREATED).json({
    message: "User created by admin",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

module.exports = {
  getMe,
  updateMe,
  updatePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  adminCreateUser,
};
