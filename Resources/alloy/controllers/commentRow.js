function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "commentRow";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        id: "row",
        comment_id: ""
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.__alloyId3 = Ti.UI.createView({
        backgroundColor: "white",
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        top: 0,
        layout: "horizontal",
        id: "__alloyId3"
    });
    $.__views.row.add($.__views.__alloyId3);
    $.__views.avatar = Ti.UI.createImageView({
        preventDefaultImage: true,
        top: "5dp",
        left: "5dp",
        width: "38dp",
        height: "38dp",
        id: "avatar"
    });
    $.__views.__alloyId3.add($.__views.avatar);
    $.__views.__alloyId4 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        bottom: "2dp",
        layout: "horizontal",
        id: "__alloyId4"
    });
    $.__views.__alloyId3.add($.__views.__alloyId4);
    $.__views.userName = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: "14dp",
            fontWeight: "bold"
        },
        textAlign: "center",
        top: "5dp",
        left: "5dp",
        id: "userName"
    });
    $.__views.__alloyId4.add($.__views.userName);
    $.__views.date = Ti.UI.createLabel({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: "13dp"
        },
        textAlign: "right",
        top: "5dp",
        right: "2dp",
        text: "asdads",
        id: "date"
    });
    $.__views.__alloyId4.add($.__views.date);
    $.__views.comment = Ti.UI.createLabel({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: "14dp"
        },
        textAlign: "left",
        top: "2dp",
        left: "5dp",
        id: "comment"
    });
    $.__views.__alloyId3.add($.__views.comment);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var model = arguments[0] || {};
    var user = model.attributes.user;
    user.photo && user.photo.urls && ($.avatar.image = user.photo.urls.square_75 || user.photo.urls.thumb_100 || user.photo.urls.original);
    $.comment.text = model.attributes.content;
    $.userName.text = (user.first_name || "") + " " + (user.last_name || "");
    $.userName.text = 0 !== $.userName.text.trim().length ? $.userName.text.trim() : user.username;
    $.date.text = moment(model.attributes.created_at).fromNow();
    $.row.comment_id = model.id || "";
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;