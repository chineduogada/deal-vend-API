const mongoose = require("mongoose");

// CONSTANT VARIABLES
const DB_STRING = process.env.DB_CONNECTION_STR.replace(
	"<PASSWORD>",
	process.env.DB_PASSWORD
);

// CONNECT TO MONGODB
mongoose
	.connect(DB_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => console.log("> Successfully connected to MongoDB..."))
	.catch((err) => console.log("Failed to connect to MongoDB.", err));

