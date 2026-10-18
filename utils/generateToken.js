const jwt = require("jsonwebtoken");

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
  });

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
