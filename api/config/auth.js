"use strict";

require("./loadEnv");

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  passwordSaltBytes: 16,
  passwordKeyLength: 64,
  passwordMinLength: 8,
};
