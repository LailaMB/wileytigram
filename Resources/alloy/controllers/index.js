function Controller() {
    function doOpen() {
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.tabGroup = Ti.UI.createTabGroup({
        id: "tabGroup"
    });
    $.__views.feedController = Alloy.createController("feed", {
        id: "feedController"
    });
    $.__views.tabGroup.addTab($.__views.feedController.getViewEx({
        recurse: true
    }));
    $.__views.friendsController = Alloy.createController("friends", {
        id: "friendsController"
    });
    $.__views.tabGroup.addTab($.__views.friendsController.getViewEx({
        recurse: true
    }));
    $.__views.settingsController = Alloy.createController("settings", {
        id: "settingsController"
    });
    $.__views.tabGroup.addTab($.__views.settingsController.getViewEx({
        recurse: true
    }));
    $.__views.tabGroup && $.addTopLevelView($.__views.tabGroup);
    doOpen ? $.__views.tabGroup.addEventListener("open", doOpen) : __defers["$.__views.tabGroup!open!doOpen"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var user = Alloy.createModel("User");
    user.login("wileytigram_admin", "wileytigram_admin", function(_response) {
        if (_response.success) {
            $.tabGroup.open();
            $.feedController.initialize();
        } else {
            alert("Error Starting Application " + _response.error);
            Ti.API.error("error logging in " + _response.error);
        }
    });
    __defers["$.__views.tabGroup!open!doOpen"] && $.__views.tabGroup.addEventListener("open", doOpen);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;