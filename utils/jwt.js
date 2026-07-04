"use strict";

const { SignJWT, jwtVerify } = require("jose");

const authConfig = require("../config/auth");

const textEncoder = new TextEncoder();

function getSecretKey() {
  return textEncoder.encode(authConfig.jwtSecret);
}

async function signAuthToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(authConfig.jwtExpiresIn)
    .sign(getSecretKey());
}

async function verifyAuthToken(token) {
  return jwtVerify(token, getSecretKey());
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
};
