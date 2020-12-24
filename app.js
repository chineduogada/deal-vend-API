/**
 * Setup the following
 * 1. security
 * 2. routes
 * 3. global error handling
 */

const express = require("express");
const productsRouter = require("./routes/productRouter");

const app = express();

app.use("/api/v1/products", productsRouter);

module.exports = app;

