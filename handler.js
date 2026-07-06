"use strict";

const { dispatch } = require("./api/routes/router");
const { jsonResponse } = require("./api/utils/http");

module.exports.hello = async () => {
  return jsonResponse(200, {
    message: "Auth API is running",
  });
};

module.exports.auth = async (event) => {
  return dispatch(event);
};
