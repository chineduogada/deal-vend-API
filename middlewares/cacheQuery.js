module.exports = (options, cb) => (req, _res, next) => {
	req.cache = true;
	req.cacheOptions = options;

	cb && cb(req);

	next();
};

