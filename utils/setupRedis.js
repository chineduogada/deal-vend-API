const mongoose = require("mongoose");
const { promisify } = require("util");
const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const redisClient = redis.createClient(redisUrl);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
	const key = JSON.stringify({
		...this.getQuery(),
		collection: this.mongooseCollection.name,
	});

	redisClient.get = promisify(redisClient.get);

	const cachedValue = await redisClient.get(key);

	if (cachedValue) {
		// ************* Why this won't work fine is BCOS `this.model(<object>)` not a <array>, and `cachedValue` could be an Array ********* //
		// const doc = new this.model(JSON.parse(cachedValue));
		// return doc;

		const convertToDocument = (plainJSON) => new this.model(plainJSON);

		let cachedDoc = JSON.parse(cachedValue);

		cachedDoc = Array.isArray(cachedDoc)
			? cachedDoc.map(convertToDocument)
			: convertToDocument(cachedDoc);

		return cachedDoc;
	}

	const result = await exec.apply(this, arguments);

	redisClient.set(key, JSON.stringify(result));

	return result;
};

