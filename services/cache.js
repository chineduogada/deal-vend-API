const mongoose = require("mongoose");
const { promisify } = require("util");
const redis = require("redis");
const devLog = require("../utils/devLog");

const redisUrl = "redis://127.0.0.1:6379";
const redisClient = redis.createClient(redisUrl);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
	this._cache = true;
	this._hashKey = JSON.stringify(options.key || "");

	return this;
};

mongoose.Query.prototype.exec = async function () {
	if (!this._cache) {
		devLog("> THIS QUERY IS NOT CACHED!");
		return await exec.apply(this, arguments);
	}

	const key = JSON.stringify({
		...this.getQuery(),
		collection: this.mongooseCollection.name,
	});

	redisClient.hget = promisify(redisClient.hget);
	const cachedValue = await redisClient.hget(this._hashKey, key);

	if (cachedValue) {
		// ************* Why this won't work fine is BCOS `this.model(<object>)` not a <array>, and `cachedValue` could be an Array ********* //
		// const doc = new this.model(JSON.parse(cachedValue));
		// return doc;

		const convertToDocument = (plainJSON) => new this.model(plainJSON);

		let cachedDoc = JSON.parse(cachedValue);
		cachedDoc = Array.isArray(cachedDoc)
			? cachedDoc.map(convertToDocument)
			: convertToDocument(cachedDoc);

		devLog("> SERVING DATA FROM REDIS SERVER");
		return cachedDoc;
	}

	const result = await exec.apply(this, arguments);
	redisClient.hset(this._hashKey, key, JSON.stringify(result));

	devLog("> SERVING DATA FROM MONGODB");
	return result;
};

module.exports = {
	clearHash: (hashKey) => {
		redisClient.del(JSON.stringify(hashKey));
	},
};

