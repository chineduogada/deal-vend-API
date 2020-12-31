module.exports = (req, path) => `${req.protocol}://${req.get("host")}${path}`;

