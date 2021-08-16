/**
 * Setup the following
 * 1. security
 * 2. routes
 * 3. global error handling
 */

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const productRouter = require("./routes/productRouter");
const userRouter = require("./routes/userRouter");
const cartRouter = require("./routes/cartRouter");
const errorController = require("./controllers/errorController");
const AppError = require("./utils/AppError");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);

app.use("*", (req, _res, next) => {
  next(
    new AppError(
      `can't find ${req.originalUrl}, with the method:${req.method}, on this server!`
    )
  );
});

// Global Error handler
app.use(errorController);

module.exports = app;
