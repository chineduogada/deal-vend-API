class AppError extends Error {
	constructor(message, statusCode) {
		super(message);

		this.message = message;
		this.statusCode = statusCode;
		this.status = statusCode >= 400 ? "fail" : "error";
		this.isExpected = true;
	}
}

module.exports = AppError;

