module.exports = (asyncFunction) => {
	return async (req, res, next) => {
		try {
			await asyncFunction(req, res, next);
		} catch (err) {
			next(err);
		}
	};
};

