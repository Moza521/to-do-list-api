const ApiError = require("../utils/apiError");
const { HTTP_STATUS } = require("../utils/constants");

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForPro = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const handleJstInvalidSignature = () =>
  new ApiError("Invalid token, please login again...", HTTP_STATUS.UNAUTHORIZED);

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    if (err.name === "JsonWebTokenError") {
      err = handleJstInvalidSignature();
    }
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") {
      err = handleJstInvalidSignature();
    }
    sendErrorForPro(err, res);
  }
};

module.exports = globalError;
