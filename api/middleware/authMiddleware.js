"use strict";

const { User } = require("../models");
const { verifyAuthToken } = require("../utils/jwt");
const languageUtility = require("../utils/languageUtility");

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token, ...rest] = String(authorizationHeader).trim().split(/\s+/);

  if (rest.length > 0 || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

async function authenticate(req, res, next) {
  const myLang = res.locals.language || "en";
  const constants = await languageUtility(myLang);

  const authorizationHeader = req.headers.authorization;
  const token = extractBearerToken(authorizationHeader);

  if (!token) {
    res.statusCode = constants.UNAUTHORIZED_STATUS_CODE || 401;
    return res.json({
      error: constants.UNAUTHORIZED_ERROR || "UNAUTHORIZED",
      errorMessage: constants.TOKEN_EXPIRED || "Token is invalid or expired"
    });
  }

  let payload;
  try {
    ({ payload } = await verifyAuthToken(token));
  } catch (error) {
    res.statusCode = constants.UNAUTHORIZED_STATUS_CODE || 401;
    return res.json({
      error: constants.UNAUTHORIZED_ERROR || "UNAUTHORIZED",
      errorMessage: constants.TOKEN_EXPIRED || "Token is invalid or expired"
    });
  }

  if (!payload.publicId || payload.tokenVersion === undefined) {
    res.statusCode = constants.UNAUTHORIZED_STATUS_CODE || 401;
    return res.json({
      error: constants.UNAUTHORIZED_ERROR || "UNAUTHORIZED",
      errorMessage: constants.TOKEN_EXPIRED || "Token is invalid or expired"
    });
  }

  const user = await User.unscoped().findOne({
    where: {
      publicId: payload.publicId,
      tokenVersion: Number(payload.tokenVersion),
    },
  });

  if (!user) {
    res.statusCode = constants.UNAUTHORIZED_STATUS_CODE || 401;
    return res.json({
      error: constants.UNAUTHORIZED_ERROR || "UNAUTHORIZED",
      errorMessage: constants.TOKEN_EXPIRED || "Token is invalid or expired"
    });
  }

  req.auth = payload;
  req.token = token;
  req.user = user;

  next();
}

module.exports = {
  authenticate,
  extractBearerToken,
};
