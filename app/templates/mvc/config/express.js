var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');

var router = express.Router();
var defaultModel = require('./default.module');
var fs = require('fs');
var path = require('path');

var methodOverride = require('method-override');<% if(options.viewEngine == 'swig'){ %>
var swig = require('swig');<% } %>

module.exports = function(app, config) {<% if(options.viewEngine == 'swig'){ %>
  app.engine('swig', swig.renderFile)<% } %>
  app.set('views', config.root + '/app/views');
  app.set('view engine', '<%= options.viewEngine %>');

  <% if(options.database == 'mongodb'){ %>
  var models = glob.sync(config.root + '/app/models/*.js');
  var registeredModels = [];
  models.forEach(function (model) {
    require(model);
    registeredModels.push(path.basename(model));
  });
<%}%>

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  <% if(options.database == 'mongodb'){ %>
  app.use('/api', router);

  registeredModels.forEach(function(model){
    var apiPath = config.root + '/app/api/' + model;
    fs.exists(apiPath, function(exists) {
      if (exists) {
        require(apiPath)(app,router);
      } else {
        new defaultModel(app,router, model);
      }
    });
  });

  <%}%>

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
    app.locals.pretty = true;
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });

};
