// setup Environment Variables
require("dotenv").config();
const app = require("./app");

// CONNECT TO MONGODB
require("./utils/connectDB");

// START SERVER LISTENING
const PORT = process.env.NODE_ENV || 8080;
app.listen(PORT, () =>
	console.log(`> Server ready on \`http://localhost:${PORT}\``)
);

