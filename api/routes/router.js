"use strict";

const routes = require("./index");
const { AppError } = require("../utils/errors");
const {
  getMethod,
  getPath,
  jsonResponse,
  normalizeHeaders,
  normalizePath,
  parseJsonBody,
} = require("../utils/http");

function buildRequest(event) {
  return {
    body: parseJsonBody(event),
    headers: normalizeHeaders(event.headers || {}),
    method: getMethod(event),
    params: event.pathParameters || {},
    path: normalizePath(getPath(event)),
    query: event.queryStringParameters || {},
    rawEvent: event,
  };
}

async function dispatch(event, availableRoutes = routes) {
  let request = {
    body: {},
    headers: {},
    method: "",
    params: {},
    path: "/",
    query: {},
    rawEvent: event,
  };

  try {
    request = buildRequest(event);

    const matchingRoutes = availableRoutes.filter((route) => {
      return normalizePath(route.path) === request.path;
    });

    if (matchingRoutes.length === 0) {
      return jsonResponse(404, {
        success: false,
        message: "Route not found",
      });
    }

    const route = matchingRoutes.find((candidate) => {
      return candidate.method === request.method;
    });

    if (!route) {
      return jsonResponse(
        405,
        {
          success: false,
          message: "Method not allowed",
        },
        {
          Allow: matchingRoutes.map((candidate) => candidate.method).join(", "),
        },
      );
    }

    const req = {
      body: request.body,
      headers: request.headers,
      params: request.params,
      query: request.query,
      path: request.path,
      method: request.method,
      rawEvent: request.rawEvent,
      auth: null,
      token: null,
      user: null,
    };

    const res = {
      statusCode: route.successStatus || 200,
      locals: {
        language: request.headers["accept-language"] || "en",
      },
      _jsonPayload: undefined,
      json(data) {
        this._jsonPayload = data;
        return this;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    for (const middleware of route.middlewares || []) {
      nextCalled = false;
      await middleware(req, res, next);
      if (!nextCalled || res._jsonPayload !== undefined) {
        break;
      }
    }

    if (
      res._jsonPayload === undefined &&
      (!route.middlewares || route.middlewares.length === 0 || nextCalled)
    ) {
      await route.handler(req, res);
    }

    const success = res.statusCode >= 200 && res.statusCode < 300;

    return jsonResponse(res.statusCode, {
      success,
      ...res._jsonPayload,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonResponse(error.statusCode || 400, {
        success: false,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      });
    }

    // console.error("Unhandled auth API error", {
    //   error,
    //   path: request.path,
    //   method: request.method,
    // });
    console.error("===== ERROR START =====");
    console.error(error);
    console.error(error.stack);
    console.error("Request:", request);
    console.error("===== ERROR END =====");

    return jsonResponse(500, {
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  dispatch,
};
