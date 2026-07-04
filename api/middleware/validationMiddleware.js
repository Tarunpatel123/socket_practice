"use strict";

const authConfig = require("../config/auth");
const languageUtility = require("../utils/languageUtility");

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function validateRegisterBody(req, res, next) {
  const myLang = res.locals.language || "en";
  const constants = await languageUtility(myLang);

  const body = req.body || {};
  const firstName = cleanString(body.firstName);
  const lastName = cleanString(body.lastName);
  const email = cleanString(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!firstName) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "firstName is required"
    });
  }

  if (!lastName) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "lastName is required"
    });
  }

  if (!email) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "email is required"
    });
  }

  if (!isValidEmail(email)) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "email must be a valid email address"
    });
  }

  if (!password) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "password is required"
    });
  }

  if (password.length < authConfig.passwordMinLength) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: `password must be at least ${authConfig.passwordMinLength} characters long`
    });
  }

  req.body = {
    firstName,
    lastName,
    email,
    password,
  };
  next();
}

async function validateLoginBody(req, res, next) {
  const myLang = res.locals.language || "en";
  const constants = await languageUtility(myLang);

  const body = req.body || {};
  const email = cleanString(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "email is required"
    });
  }

  if (!isValidEmail(email)) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "email must be a valid email address"
    });
  }

  if (!password) {
    res.statusCode = constants.BAD_REQUEST_STATUS_CODE || 400;
    return res.json({
      error: constants.BAD_REQUEST_TYPE || "BAD_REQUEST",
      errorMessage: "password is required"
    });
  }

  req.body = {
    email,
    password,
  };
  next();
}

module.exports = {
  validateLoginBody,
  validateRegisterBody,
};
