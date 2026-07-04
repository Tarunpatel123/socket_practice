"use strict";

const english = {
  SUCCESS_STATUS_CODE: 200,
  CREATED_STATUS_CODE: 201,
  NOT_FOUND_STATUS_CODE: 404,
  BAD_REQUEST_STATUS_CODE: 400,
  UNAUTHORIZED_STATUS_CODE: 401,
  CONFLICT_STATUS_CODE: 409,
  SOMETHING_WENT_WRONG_STATUS_CODE: 500,

  NOT_FOUND_ERROR: "NOT_FOUND",
  RECORD_NOT_FOUND: "Record not found.",

  SOMETHING_WENT_WRONG_TYPE: "SERVER_ERROR",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again later.",

  BAD_REQUEST_TYPE: "BAD_REQUEST",
  VALIDATION_ERROR: "Validation failed.",

  UNAUTHORIZED_ERROR: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "Invalid email or password.",
  TOKEN_EXPIRED: "Token has expired or is invalid.",

  CONFLICT_ERROR: "CONFLICT",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists."
};

async function languageUtility(lang) {
  // Can be extended to support multiple languages in the future
  return english;
}

module.exports = languageUtility;
