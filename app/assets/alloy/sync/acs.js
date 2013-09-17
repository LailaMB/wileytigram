function S4() {
	return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
	return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
	Cloud = require("ti.cloud");
	Cloud.debug = !0;
	config.Cloud = Cloud;
}

function Sync(method, model, opts) { debugger;
	var object_name = model.config.adapter.collection_name;

	if (object_name === "photos") {
		processACSPhotos(model, method, opts);
	} else if (object_name === "users") {
		processACSUsers(model, method, opts);
	} else if (object_name === "reviews") {
		processACSComments(model, method, opts);
	}
}

/**
 * this is a separate handler for when the object being processed
 * is an ACS Photo
 */
function processACSPhotos(model, method, opts) {
	switch (method) {
		case "create":
			// include attributes into the params for ACS
			Cloud.Photos.create(model.toJSON(), function(e) {
				if (e.success) {

					// save the meta data with object
					model.meta = e.meta;

					// return the individual photo object found
					opts.success(e.photos[0]);

					// trigger fetch for UI updates
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

			method((opts.data || {}), function(e) {
				if (e.success) {
					model.meta = e.meta;
					if (e.photos.length === 1) {
						opts.success(e.photos[0]);
					} else {
						opts.success(e.photos);
					}
					model.trigger("fetch");
					return;
				} else {
					Ti.API.error("Cloud.Photos.query " + e.message);
					opts.error(e.error && e.message || e);
				}
			});
			break;
		case "update":
		case "delete":
			// Not currently implemented, let the user know
			alert("Not Implemented Yet");
			break;
	}
}

function processACSComments(model, method, opts) {

	switch (method) {
		case "create":
			// stick attributes into the params variable
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
			// since we are only ever listing the reviews/comments,
			// we only need to support querying the objects
			Cloud.Reviews.query((opts.data || {}), function(e) {
				if (e.success) {
					model.meta = e.meta;
					if (e.reviews.length === 1) {
						opts.success(e.reviews[0]);
					} else {
						opts.success(e.reviews);
					}
					model.trigger("fetch");
					return;
				} else {
					Ti.API.error("Reviews.query " + e.message);
					opts.error(e.error && e.message || e);
				}
			});
			break;
		case "update":
		case "delete":
			var params = {};

			// look for the review id in opts or on model
			params.review_id = model.id = opts.id || model.id;

			// get the id of the associated photo
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
