/**
 * Setup the following
 * 1. security
 * 2. routes
 * 3. global error handling
 */

const express = require("express");
const productsRouter = require("./routes/productRouter");
const errorController = require("./controllers/errorController");
const AppError = require("./utils/AppError");

require("./services/cache");

const app = express();

app.use(express.json());

app.use("/api/v1/products", productsRouter);

app.use("*", (req, res, next) => {
	next(new AppError(`can't find ${req.originalUrl}, on this server!`));
});

app.use(errorController);

module.exports = app;

