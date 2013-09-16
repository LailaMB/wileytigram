function Controller() {
    function cameraButtonClicked() {
        alert("user clicked camera button");
        var photoSource = inSimulator ? Titanium.Media.openPhotoGallery : Titanium.Media.showCamera;
        photoSource({
            success: function(event) {
                processImage(event.media, function(processResponse) {
                    if (processResponse.success) {
                        var rowController = Alloy.createController("feedRow", processResponse.model);
                        if (0 === $.feedTable.getData().length) {
                            $.feedTable.setData([]);
                            $.feedTable.appendRow(rowController.getView(), true);
                        } else $.feedTable.insertRowBefore(0, rowController.getView(), true);
                    } else alert("Error saving photo " + processResponse.message);
                });
            },
            cancel: function() {},
            error: function(error) {
                error.code == Titanium.Media.NO_CAMERA ? alert("Please run this test on device") : alert("Unexpected error: " + error.code);
            },
            saveToPhotoGallery: false,
            allowEditing: true,
            mediaTypes: [ Ti.Media.MEDIA_TYPE_PHOTO ]
        });
    }
    function processImage(_mediaObject, _callback) {
        var parameters = {
            photo: _mediaObject,
            title: "Sample Photo " + new Date(),
            "photo_sizes[preview]": "200x200#",
            "photo_sizes[iphone]": "320x320#",
            "photo_sync_sizes[]": "preview"
        };
        var photo = Alloy.createModel("Photo", parameters);
        photo.save({}, {
            success: function(_model) {
                debugger;
                Ti.API.info("success: " + _model.toJSON());
                _callback({
                    model: _model,
                    message: null,
                    success: true
                });
            },
            error: function(e) {
                debugger;
                Ti.API.error("error: " + e.message);
                _callback({
                    model: parameters,
                    message: e.message,
                    success: false
                });
            }
        });
    }
    function loadPhotos() {
        var rows = [];
        var photos = Alloy.Collections.photo || Alloy.Collections.instance("Photo");
        var where = {
            title: {
                $exists: true
            }
        };
        photos.fetch({
            data: {
                order: "-created_at",
                where: where
            },
            success: function() {
                photos.each(function(photo) {
                    var photoRow = Alloy.createController("feedRow", photo);
                    rows.push(photoRow.getView());
                });
                $.feedTable.data = rows;
            },
            error: function(error) {
                alert("Error loading Feed " + e.message);
                Ti.API.error(JSON.stringify(error));
            }
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "feed";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.feedWindow = Ti.UI.createWindow({
        backgroundColor: "#fff",
        id: "feedWindow",
        title: "Feed"
    });
    $.__views.cameraButton = Ti.UI.createButton({
        title: "Camera",
        id: "cameraButton"
    });
    $.__views.feedWindow.rightNavButton = $.__views.cameraButton;
    $.__views.feedTable = Ti.UI.createTableView({
        id: "feedTable"
    });
    $.__views.feedWindow.add($.__views.feedTable);
    $.__views.feedTab = Ti.UI.createTab({
        window: $.__views.feedWindow,
        id: "feedTab",
        title: "Feed"
    });
    $.__views.feedTab && $.addTopLevelView($.__views.feedTab);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var inSimulator = -1 !== Ti.Platform.model.indexOf("Simulator") || "x86_64" == Ti.Platform.model || "google_sdk" == Ti.Platform.model;
    $.cameraButton.addEventListener("click", cameraButtonClicked);
    $.initialize = function() {
        Alloy.Collections.photo && Alloy.Collections.photo.reset();
        loadPhotos();
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;