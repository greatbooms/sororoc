module.exports.success = function(res, message) {
  res.status(200);
  res.json(message);
}

module.exports.error = function(res, message, code) {
  res.status(code);
  res.json(message);
}