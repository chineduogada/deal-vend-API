const sendDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		err,
	});
};

const sendProd = (err, res) => {
	if (err.isExpected) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}

	res.status(err.statusCode).json({
		status: err.status,
		message: "an unexpected error occurred!",
	});
};

module.exports = (err, req, res, next) => {
	err = { ...err, message: err.message, stack: err.stack };
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV !== "production") {
		sendDev(err, res);
	} else {
		sendProd(err, res);
	}

	// sendProd(err, res);
};

