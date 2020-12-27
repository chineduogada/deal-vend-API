const _ = require("lodash");
const { clearHash } = require("../services/cache");
const devLog = require("../utils/devLog");

module.exports = (reqHashKey, plainHashKey) => async (req, _res, next) => {
	await next();

	const hashKey = reqHashKey ? _.get(req, reqHashKey) : plainHashKey;
	clearHash(hashKey);
};

