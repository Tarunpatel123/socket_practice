"use strict";

const fs = require("node:fs");
const path = require("node:path");

let loaded = false;

function unescapeDoubleQuotedValue(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function parseEnvLine(line) {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith("#")) {
    return null;
  }

  const normalizedLine = trimmedLine.startsWith("export ")
    ? trimmedLine.slice(7).trim()
    : trimmedLine;
  const equalsIndex = normalizedLine.indexOf("=");

  if (equalsIndex === -1) {
    return null;
  }

  const key = normalizedLine.slice(0, equalsIndex).trim();
  let value = normalizedLine.slice(equalsIndex + 1).trim();

  if (!key) {
    return null;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    const quote = value[0];
    value = value.slice(1, -1);

    if (quote === '"') {
      value = unescapeDoubleQuotedValue(value);
    }
  } else {
    const inlineCommentIndex = value.search(/\s+#/);

    if (inlineCommentIndex !== -1) {
      value = value.slice(0, inlineCommentIndex).trim();
    }
  }

  return { key, value };
}

function loadEnvFile(envFilePath = path.resolve(__dirname, "..", ".env")) {
  if (loaded || process.env.NODE_ENV === "production") {
    return {};
  }

  loaded = true;

  if (!fs.existsSync(envFilePath)) {
    return {};
  }

  const contents = fs.readFileSync(envFilePath, "utf8");
  const parsed = {};

  for (const line of contents.split(/\r?\n/)) {
    const entry = parseEnvLine(line);

    if (!entry) {
      continue;
    }

    parsed[entry.key] = entry.value;
    process.env[entry.key] = entry.value;
  }

  return parsed;
}

loadEnvFile();

module.exports = loadEnvFile;
