"use strict";

const { dispatch } = require("./routes/router");
const { jsonResponse } = require("./utils/http");

exports.hello = async () => {
  return jsonResponse(200, {
    message: "Auth API is running",
  });
};

exports.auth = async (event) => {
  return dispatch(event);
};
