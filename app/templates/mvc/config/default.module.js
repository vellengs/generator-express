var mongoose = require('mongoose');
var pluralize = require('pluralize');

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = function (app, router, modelName) {
    modelName = capitaliseFirstLetter(modelName.replace(".js",""));

    var Model = mongoose.model(modelName);
    var entryName = modelName ;
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

    var routerName = pluralize(modelName);
    router.get('/' + routerName, checkAdmin, action.index);
    router.get('/'+routerName+'/:id?', checkAdmin, action.show);
    router.post('/'+ routerName, checkAdmin, action.create);
    router.put('/'+ routerName,checkAdmin,action.update);
    router.delete('/'+ routerName,checkAdmin,action.destroy);
};
