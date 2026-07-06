"use strict";

const express = require("express");
const cors = require("cors");

function requireLocalModule(basePath) {
  const candidates = [`${basePath}.js`, `${basePath}.cjs`, basePath];
  let lastError = null;
  for (const modulePath of candidates) {
    try {
      return require(modulePath);
    } catch (err) {
      if (err.code === "MODULE_NOT_FOUND" && err.message.includes(modulePath)) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error(`Cannot find local module ${basePath}`);
}

const routesList = requireLocalModule("./routes/authRoutes");
const authRoutesDirect = requireLocalModule("./routes/authRoutes");

let authController = null;
let authControllerError = null;
try {
  authController = requireLocalModule("./controllers/authController");
} catch (err) {
  authControllerError = {
    message: err.message,
    stack: err.stack,
  };
}

const resolvedRoutes = Array.isArray(routesList)
  ? routesList
  : routesList.default || [];

console.log(
  "DEBUG routesList:",
  typeof routesList,
  "isArray:",
  Array.isArray(routesList),
  "length:",
  routesList?.length,
);
console.log(
  "DEBUG authRoutesDirect:",
  typeof authRoutesDirect,
  "isArray:",
  Array.isArray(authRoutesDirect),
  "length:",
  authRoutesDirect?.length,
);

const app = express();

function resolvePath(path) {
  try {
    return require.resolve(path);
  } catch (err) {
    return err.message;
  }
}

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} URL: "${req.url}" | PATH: "${req.path}" | BASE: "${req.baseUrl}" | ORIGINAL: "${req.originalUrl}"`,
  );
  next();
});

// Root check endpoint
app.get(["/", "/api"], (req, res) => {
  res.json({
    message: "Auth API is running",
  });
});

// Debug endpoint to inspect route loading on Vercel
// app.get(["/debug", "/api/debug"], (req, res) => {
//   res.json({
//     routesListType: typeof routesList,
//     isArray: Array.isArray(routesList),
//     routesListKeys: Object.keys(routesList || {}),
//     authRoutesDirectType: typeof authRoutesDirect,
//     authRoutesDirectKeys: Object.keys(authRoutesDirect || {}),
//     authControllerType: typeof authController,
//     authControllerKeys: Object.keys(authController || {}),
//     authControllerError: authControllerError,
//     registerType: typeof (authController || {}).register,
//     loginType: typeof (authController || {}).login,
//     logoutType: typeof (authController || {}).logout,
//     resolvedRoutesLength: resolvedRoutes.length
//   });
// });
app.get("/debug", (req, res) => {
  let authRoutes;
  let authController;

  try {
    authRoutes = requireLocalModule("./routes/authRoutes");
  } catch (e) {
    authRoutes = {
      error: e.message,
      stack: e.stack,
    };
  }

  try {
    authController = requireLocalModule("./controllers/authController");
  } catch (e) {
    authController = {
      error: e.message,
      stack: e.stack,
    };
  }

  res.json({
    cwd: process.cwd(),
    dirname: __dirname,

    authRoutesPath: resolvePath("./routes/authRoutes"),
    authControllerPath: resolvePath("./controllers/authController"),

    authRoutes,
    authController,

    authRoutesType: typeof authRoutes,
    authControllerType: typeof authController,

    authRoutesKeys: Object.keys(authRoutes || {}),
    authControllerKeys: Object.keys(authController || {}),

    authRoutesLength: Array.isArray(authRoutes) ? authRoutes.length : null,
  });
});

console.log(`Number of resolved routes: ${resolvedRoutes.length}`);

// Dynamic routes mapper
const apiRouter = express.Router();

resolvedRoutes.forEach((route) => {
  const method = route.method.toLowerCase();
  const path = route.path;
  const middlewares = route.middlewares || [];

  console.log(`Mapping route: ${method.toUpperCase()} ${path}`);

  apiRouter[method](path, ...middlewares, async (req, res, next) => {
    try {
      if (route.successStatus) {
        res.status(route.successStatus);
      }
      await route.handler(req, res);
    } catch (err) {
      next(err);
    }
  });
});


app.use("/", apiRouter);
app.use("/api", apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(err.details ? { details: err.details } : {}),
  });
});

// Start server locally if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running locally at http://localhost:${PORT}`);
  });
}

module.exports = app;
