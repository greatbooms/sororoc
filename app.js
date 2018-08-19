'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var bodyParser = require('body-parser');
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  // install middleware
  swaggerExpress.register(app);

  app.use(SwaggerUi(swaggerExpress.runner.swagger));

  var port = process.env.PORT || 40005;
  app.listen(port);

  console.log('sororoc server start!! port = ' + port);
});