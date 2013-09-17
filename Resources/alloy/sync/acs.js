function S4() {
    return (0 | 65536 * (1 + Math.random())).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
    Cloud = require("ti.cloud");
    Cloud.debug = !0;
    config.Cloud = Cloud;
}

function Sync(method, model, opts) {
    debugger;
    var object_name = model.config.adapter.collection_name;
    "photos" === object_name ? processACSPhotos(model, method, opts) : "users" === object_name ? processACSUsers(model, method, opts) : "reviews" === object_name && processACSComments(model, method, opts);
}

function processACSPhotos(model, method, opts) {
    switch (method) {
      case "create":
        Cloud.Photos.create(model.toJSON(), function(e) {
            if (e.success) {
                model.meta = e.meta;
                opts.success(e.photos[0]);
                model.trigger("fetch");
            } else {
                Ti.API.error("Photos.create " + e.message);
                opts.error(e.error && e.message || e);
            }
        });
        break;

      case "read":
        model.id && (opts.data.photo_id = model.id);
        var method = model.id ? Cloud.Photos.show : Cloud.Photos.query;
        method(opts.data || {}, function(e) {
            if (e.success) {
                model.meta = e.meta;
                1 === e.photos.length ? opts.success(e.photos[0]) : opts.success(e.photos);
                model.trigger("fetch");
                return;
            }
            Ti.API.error("Cloud.Photos.query " + e.message);
            opts.error(e.error && e.message || e);
        });
        break;

      case "update":
      case "delete":
        alert("Not Implemented Yet");
    }
}

function processACSComments(model, method, opts) {
    switch (method) {
      case "create":
        var params = model.toJSON();
        Cloud.Reviews.create(params, function(e) {
            if (e.success) {
                model.meta = e.meta;
                opts.success && opts.success(e.reviews[0]);
                model.trigger("fetch");
            } else {
                Ti.API.error("Comments.create " + e.message);
                opts.error && opts.error(e.error && e.message || e);
            }
        });

      case "read":
        Cloud.Reviews.query(opts.data || {}, function(e) {
            if (e.success) {
                model.meta = e.meta;
                1 === e.reviews.length ? opts.success(e.reviews[0]) : opts.success(e.reviews);
                model.trigger("fetch");
                return;
            }
            Ti.API.error("Reviews.query " + e.message);
            opts.error(e.error && e.message || e);
        });
        break;

      case "update":
      case "delete":
        var params = {};
        params.review_id = model.id = opts.id || model.id;
        params.photo_id = opts.photo_id;
        Cloud.Reviews.remove(params, function(e) {
            if (e.success) {
                model.meta = e.meta;
                opts.success && opts.success({}), model.trigger("fetch");
                return;
            }
            Ti.API.error(e);
            opts.error && opts.error(e.error && e.message || e);
        });
    }
}

var _ = require("alloy/underscore")._;

module.exports.sync = Sync;

module.exports.beforeModelCreate = function(config) {
    config = config || {};
    config.data = {};
    InitAdapter(config);
    return config;
};

module.exports.afterModelCreate = function(Model) {
    Model = Model || {};
    Model.prototype.config.Model = Model;
    return Model;
};