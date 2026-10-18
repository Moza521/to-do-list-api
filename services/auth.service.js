const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { generateTokens } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const { HTTP_STATUS } = require("../utils/constants");

// helper عشان نبعت الكوكيز
const sendTokens = (res, user, tokens) => {
  // Refresh Token في Cookie آمنة
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true, // مش هتتقرا بـ JS - حماية من XSS
    secure: process.env.NODE_ENV === "production", // في production بس https
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  });
  res.json({
    user: { id: user._id, email: user.email, role: user.role, name: user.name },
    accessToken: tokens.accessToken,
  });
};

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return next(new ApiError("User already exists", HTTP_STATUS.BAD_REQUEST));
  }

  const user = await User.create({ name, email, password });

  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.status(HTTP_STATUS.CREATED).json({ user, ...tokens });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new ApiError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED),
    );

  const valid = bcrypt.compare(password);
  if (!valid)
    return next(
      new ApiError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED),
    );

  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.json({ user, ...tokens });
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return next(new ApiError("No refresh token", HTTP_STATUS.UNAUTHORIZED));

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    return next(new ApiError("Invalid refresh token", HTTP_STATUS.FORBIDDEN));
  }
  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save();
  sendTokens(res, user, tokens);
};

const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id) {
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

module.exports = { register, login, refresh, logout };
