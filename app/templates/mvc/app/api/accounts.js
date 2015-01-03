var mongoose = require('mongoose'),
  Model = mongoose.model('Account');
var entryName = "Account";
var checkAdmin = function (req, res, next) {
  next();
};

var action = {
  index: function (req, res) {
    var limit = req.query.limit || 100;
    Model.find().limit(limit).exec(function (err, data) {
      res.json({err: err, message: !err || 'no ' + entryName + ' data', data: data});
    });
  },
  show: function (req, res) {
    Model.find({_id: req.params.id}, function (err, data) {
      res.json({err: err, message: !err || entryName + ' no found', data: data});
    });
  },
  create: function (req, res) {
    var entry = new Model(req.body);
    var test = JSON.stringify(entry);
    entry.save(function (err, data) {
      res.json({
        err: err,
        entry: err || data._doc,
        message: !err || 'oops, something went wrong while saving ' + entryName
      });
    });
  },
  update: function (req, res) {
    var entry = new Model(req.body);
    Model.findOneAndUpdate({_id: req.params.id}, {$set: entry}, function (err, data) {
      res.json({
        err: err,
        entry: data._doc,
        message: !err || 'oops, something went wrong while updating ' + entryName
      });
    });
  },
  destroy: function (req, res) {
    Model.findOneAndRemove({_id: req.params.id}, function (err, data) {
      res.json({err: err, message: !err || entryName + ' deleted', data: data});
    });
  }
};

module.exports = function (app, router) {
  router.get('/accounts', checkAdmin, action.index);
  router.get('/accounts/:id?', checkAdmin, action.show);
  router.post('/accounts', checkAdmin, action.create);
};
