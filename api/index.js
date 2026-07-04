"use strict";

const express = require("express");
const cors = require("cors");
const routesList = require("../routes/index.js");
const resolvedRoutes = Array.isArray(routesList) ? routesList : (routesList.default || []);

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Auth API is running",
  });
});

console.log(`Number of resolved routes: ${resolvedRoutes.length}`);

// Dynamic routes mapper
resolvedRoutes.forEach((route) => {
  const method = route.method.toLowerCase();
  const path = route.path;
  const middlewares = route.middlewares || [];

  console.log(`Mapping route: ${method.toUpperCase()} ${path}`);

  app[method](path, ...middlewares, async (req, res, next) => {
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
