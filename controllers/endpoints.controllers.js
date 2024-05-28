const endpointsFile = require("../endpoints.json");

exports.getEndpoints = (req, res, next) => {
  res.status(200).send(endpointsFile);
};
