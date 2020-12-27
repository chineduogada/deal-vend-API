const _ = require("lodash");
const { clearHash } = require("../services/cache");

module.exports = (reqHashKey, plainHashKey) => async (req, _res, next) => {
	await next();

	if (reqHashKey) {
		return clearHash(_.get(req, reqHashKey));
	}

	clearHash(plainHashKey);
};

