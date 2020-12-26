module.exports = (req, _res, next) => {
	req.cache = true;
	next();
};

