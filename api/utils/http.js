"use strict";

const { badRequest } = require("./errors");

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function normalizeHeaders(headers = {}) {
  return Object.entries(headers).reduce((accumulator, [key, value]) => {
    accumulator[key.toLowerCase()] = value;
    return accumulator;
  }, {});
}

function getMethod(event = {}) {
  return String(
    event.requestContext?.http?.method || event.httpMethod || "",
  ).toUpperCase();
}

function getPath(event = {}) {
  const path =
    event.rawPath ||
    event.path ||
    event.requestContext?.http?.path ||
    "/";
  const stage = event.requestContext?.stage;

  if (stage && stage !== "$default") {
    if (path === `/${stage}`) {
      return "/";
    }

    if (path.startsWith(`/${stage}/`)) {
      return path.slice(stage.length + 1) || "/";
    }
  }

  return path || "/";
}

function normalizePath(path) {
  if (!path || path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "") || "/";
}

function parseJsonBody(event = {}) {
  if (!event.body) {
    return {};
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  if (typeof rawBody === "object") {
    return rawBody;
  }

  if (typeof rawBody !== "string") {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw badRequest("Request body must be valid JSON");
  }
}

function jsonResponse(statusCode, payload = {}, headers = {}) {
  return {
    statusCode,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body:
      payload === undefined
        ? ""
        : JSON.stringify(payload),
  };
}

module.exports = {
  getMethod,
  getPath,
  jsonResponse,
  normalizeHeaders,
  normalizePath,
  parseJsonBody,
};
