const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager Pro API",
      version: "1.0.0",
      description: "Task Manager Pro API - Full CRUD with Auth",
    },
    servers: [
      { url: "http://localhost:5000", description: "Local" },
      { url: "https://your-api.onrender.com", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
