"use strict";

require("./loadEnv");

function buildConfig(database) {
  const baseConfig = {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database,
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
  };

  if (process.env.DB_PORT) {
    const port = Number(process.env.DB_PORT);

    if (Number.isFinite(port)) {
      baseConfig.port = port;
    }
  }

  if (process.env.DATABASE_URL) {
    return {
      use_env_variable: "DATABASE_URL",
      dialect: process.env.DB_DIALECT || "mysql",
      logging: false,
    };
  }

  return {
    ...baseConfig,
    logging: false,
  };
}

const defaultDatabaseName = process.env.DB_NAME || "chat_auth";

module.exports = {
  development: buildConfig(defaultDatabaseName),
  test: buildConfig(process.env.DB_NAME_TEST || `${defaultDatabaseName}_test`),
  production: buildConfig(defaultDatabaseName),
};
