const { HTTP_STATUS } = require("../utils/constants");

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({
          message:
            "Access denied, You don't have permission to access this route",
        });
    }
    next();
  };
};
