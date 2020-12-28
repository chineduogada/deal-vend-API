module.exports = (inputObj, schema) => {
	const { error } = schema.validate(inputObj);

	return error;
};

