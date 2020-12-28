/**
 * Setup the following
 * 1. security
 * 2. routes
 * 3. global error handling
 */

const express = require("express");
const productRouter = require("./routes/productRouter");
const userRouter = require("./routes/userRouter");
const errorController = require("./controllers/errorController");
const AppError = require("./utils/AppError");

require("./services/cache");

const app = express();

app.use(express.json());

app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);

app.use("*", (req, _res, next) => {
	next(
		new AppError(
			`can't find ${req.originalUrl}, with the method:${req.method}, on this server!`
		)
	);
});

app.use(errorController);

module.exports = app;

