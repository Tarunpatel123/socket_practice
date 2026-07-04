"use strict";

const {
  login,
  logout,
  register,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const {
  validateLoginBody,
  validateRegisterBody,
} = require("../middleware/validationMiddleware");

module.exports = [
  {
    method: "POST",
    path: "/auth/register",
    middlewares: [validateRegisterBody],
    handler: register,
    successStatus: 201,
  },
  {
    method: "POST",
    path: "/auth/login",
    middlewares: [validateLoginBody],
    handler: login,
    successStatus: 200,
  },
  {
    method: "POST",
    path: "/auth/logout",
    middlewares: [authenticate],
    handler: logout,
    successStatus: 200,
  },
];
