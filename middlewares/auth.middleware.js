const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const { HTTP_STATUS } = require("../utils/constants");

exports.protect = async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders?.startsWith("Bearer ")) {
    return next(new ApiError("no token provided", HTTP_STATUS.UNAUTHORIZED));
  }
  const token = authHeaders.split(" ")[1];
  if (!token) {
    return next(
      new ApiError(
        "You are not authenticated please login",
        HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }
  const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(decode.id);
  if (!user) {
    return next(
      new ApiError(
        "The user belonging to this token does not exist",
        HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }

  // if (!user.active) {
  //   return next(new ApiError("user not active", HTTP_STATUS.UNAUTHORIZED));
  // }
  req.user = user;
  next();
};
