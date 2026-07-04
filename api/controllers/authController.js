"use strict";

const UUID = require("uuid-int");
const authService = require("../services/authService");
const languageUtility = require("../utils/languageUtility");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signAuthToken } = require("../utils/jwt");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function toPublicUser(user) {
  return typeof user.toPublicJSON === "function" ? user.toPublicJSON() : user;
}

async function issueAuthToken(user) {
  return signAuthToken({
    publicId: user.publicId,
    name: user.firstName,
    email: user.email,
    tokenVersion: user.tokenVersion,
  });
}

module.exports = {
  register: async (req, res) => {
    const myLang = res.locals.language || "en";
    const constants = await languageUtility(myLang);
    let response = {};

    try {
      const { firstName, lastName, email, password } = req.body;
      const normalizedEmailAddress = normalizeEmail(email);

      // Check if user already exists
      const existingUser = await authService.findOne({
        where: { email: normalizedEmailAddress },
      });

      if (existingUser) {
        res.statusCode = constants.CONFLICT_STATUS_CODE || 409;
        response.error = constants.CONFLICT_ERROR || "CONFLICT";
        response.errorMessage = constants.EMAIL_ALREADY_EXISTS || "An account with this email already exists.";
        return res.json(response);
      }

      // Generate custom numeric UUID-int
      const randomNumber = Math.floor(Math.random() * 500 + 1);
      const generator = UUID(randomNumber);
      const publicId = generator.uuid();

      // Create new user
      const user = await authService.create({
        publicId,
        firstName: String(firstName || "").trim(),
        lastName: String(lastName || "").trim(),
        email: normalizedEmailAddress,
        passwordHash: hashPassword(password),
        tokenVersion: 0,
      });

      if (!user) {
        res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
        response.error = constants.BAD_REQUEST_TYPE || "BAD_REQUEST";
        response.errorMessage = constants.SOMETHING_WENT_WRONG || "Something went wrong.";
        return res.json(response);
      }

      // Issue JWT token
      const token = await issueAuthToken(user);

      res.statusCode = constants.CREATED_STATUS_CODE || 201;
      response.result = {
        user: toPublicUser(user),
        token,
      };
      return res.json(response);
    } catch (error) {
      console.log("error: auth controller register failed.", error);
      response.error = constants.SOMETHING_WENT_WRONG_TYPE;
      response.errorMessage = constants.SOMETHING_WENT_WRONG;
      res.statusCode = constants.SOMETHING_WENT_WRONG_STATUS_CODE;
      return res.json(response);
    }
  },

  login: async (req, res) => {
    const myLang = res.locals.language || "en";
    const constants = await languageUtility(myLang);
    let response = {};

    try {
      const { email, password } = req.body;
      const normalizedEmailAddress = normalizeEmail(email);

      // Find user
      const user = await authService.findOne({
        where: { email: normalizedEmailAddress },
      });

      if (!user) {
        res.statusCode = constants.UNAUTHORIZED_STATUS_CODE || 401;
        response.error = constants.UNAUTHORIZED_ERROR || "UNAUTHORIZED";
        response.errorMessage = constants.INVALID_CREDENTIALS || "Invalid email or password.";
        return res.json(response);
      }

      // Verify password
      const passwordIsValid = verifyPassword(password, user.passwordHash);

      if (!passwordIsValid) {
        res.statusCode = constants.UNAUTHORIZED_STATUS_CODE || 401;
        response.error = constants.UNAUTHORIZED_ERROR || "UNAUTHORIZED";
        response.errorMessage = constants.INVALID_CREDENTIALS || "Invalid email or password.";
        return res.json(response);
      }

      // Issue token
      const token = await issueAuthToken(user);

      res.statusCode = constants.SUCCESS_STATUS_CODE || 200;
      response.result = {
        user: toPublicUser(user),
        token,
      };
      return res.json(response);
    } catch (error) {
      console.log("error: auth controller login failed.", error);
      response.error = constants.SOMETHING_WENT_WRONG_TYPE;
      response.errorMessage = constants.SOMETHING_WENT_WRONG;
      res.statusCode = constants.SOMETHING_WENT_WRONG_STATUS_CODE;
      return res.json(response);
    }
  },

  logout: async (req, res) => {
    const myLang = res.locals.language || "en";
    const constants = await languageUtility(myLang);
    let response = {};

    try {
      const user = req.user;
      const nextTokenVersion = Number(user.tokenVersion || 0) + 1;

      // Update user tokenVersion
      const updated = await authService.update({
        values: { tokenVersion: nextTokenVersion },
        where: { id: user.id }
      });

      if (!updated) {
        res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
        response.error = constants.BAD_REQUEST_TYPE || "BAD_REQUEST";
        response.errorMessage = constants.SOMETHING_WENT_WRONG || "Something went wrong.";
        return res.json(response);
      }

      res.statusCode = constants.SUCCESS_STATUS_CODE || 200;
      response.result = {
        message: "Logged out successfully"
      };
      return res.json(response);
    } catch (error) {
      console.log("error: auth controller logout failed.", error);
      response.error = constants.SOMETHING_WENT_WRONG_TYPE;
      response.errorMessage = constants.SOMETHING_WENT_WRONG;
      res.statusCode = constants.SOMETHING_WENT_WRONG_STATUS_CODE;
      return res.json(response);
    }
  }
};
