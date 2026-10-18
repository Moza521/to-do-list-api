const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const cookieParser = require("cookie-parser");
const allowedOrigins = require("./middlewares/cors.middleware");
const { specs } = require("./config/swagger");
const swaggerUi = require("swagger-ui-express");
const dbConnection = require("./config/db");
const globalError = require("./middlewares/errorHandler.middleware");

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(allowedOrigins);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
const { HTTP_STATUS } = require("./utils/constants");

const ApiError = require("./utils/apiError");
dbConnection();

// Routes
app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/tasks", require("./routes/task.route"));
app.use("/api/v1/users", require("./routes/user.route"));

app.use((req, res, next) => {
  next(
    new ApiError(
      `Can't Find ${req.originalUrl} On This Server`,
      HTTP_STATUS.NOT_FOUND,
    ),
  );
});

app.use(globalError);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down the server...");
    process.exit(1);
  });
});
