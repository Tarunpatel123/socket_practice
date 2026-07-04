"use strict";

const {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} = require("node:crypto");

const authConfig = require("../config/auth");
const { badRequest } = require("./errors");

function hashPassword(password) {
  if (typeof password !== "string" || !password.trim()) {
    throw badRequest("Password is required");
  }

  const salt = randomBytes(authConfig.passwordSaltBytes).toString("hex");
  const derivedKey = scryptSync(
    password,
    salt,
    authConfig.passwordKeyLength,
  ).toString("hex");

  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (
    typeof password !== "string" ||
    !password.trim() ||
    typeof storedHash !== "string" ||
    !storedHash.includes(":")
  ) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  const derivedKey = scryptSync(
    password,
    salt,
    authConfig.passwordKeyLength,
  ).toString("hex");

  const originalBuffer = Buffer.from(originalHash, "hex");
  const derivedBuffer = Buffer.from(derivedKey, "hex");

  if (originalBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(originalBuffer, derivedBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
