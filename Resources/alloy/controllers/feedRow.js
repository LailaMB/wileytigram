function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "feedRow";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        id: "row",
        row_id: ""
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.__alloyId6 = Ti.UI.createView({
        layout: "vertical",
        width: "90%",
        id: "__alloyId6"
    });
    $.__views.row.add($.__views.__alloyId6);
    $.__views.titleLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: "18sp"
        },
        textAlign: "center",
        text: "",
        id: "titleLabel"
    });
    $.__views.__alloyId6.add($.__views.titleLabel);
    $.__views.imageContainer = Ti.UI.createView({
        width: "300dp",
        height: "300dp",
        id: "imageContainer"
    });
    $.__views.__alloyId6.add($.__views.imageContainer);
    $.__views.image = Ti.UI.createImageView({
        preventDefaultImage: true,
        top: "10dp",
        left: "10dp",
        width: "280dp",
        height: "280dp",
        id: "image"
    });
    $.__views.imageContainer.add($.__views.image);
    $.__views.buttonContainer = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "42dp",
        id: "buttonContainer"
    });
    $.__views.__alloyId6.add($.__views.buttonContainer);
    $.__views.commentButton = Ti.UI.createButton({
        width: "50%",
        height: "32dp",
        title: "Comment",
        id: "commentButton"
    });
    $.__views.buttonContainer.add($.__views.commentButton);
    $.__views.shareButton = Ti.UI.createButton({
        width: "50%",
        height: "32dp",
        title: "Share",
        id: "shareButton"
    });
    $.__views.buttonContainer.add($.__views.shareButton);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var model = arguments[0] || {};
    $.image.image = model.attributes.urls.preview;
    $.titleLabel.text = model.attributes.title || "";
    $.row_id = model.id || "";
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;