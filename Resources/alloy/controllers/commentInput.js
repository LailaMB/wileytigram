function Controller() {
    function handleWindowOpened() {
        $.commentContent.focus();
    }
    function handleButtonClicked(_event) {
        var returnParams = {
            success: false,
            content: null
        };
        "saveButton" === _event.source.id && (returnParams = {
            success: true,
            content: $.commentContent.value()
        });
        callbackFunction && callbackFunction(returnParams);
        setTimeout(function() {
            $.mainWindow.close();
        }, 200);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "commentInput";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.mainWindow = Ti.UI.createWindow({
        backgroundColor: "#fff",
        id: "mainWindow"
    });
    $.__views.mainWindow && $.addTopLevelView($.__views.mainWindow);
    $.__views.cancelButton = Ti.UI.createButton({
        title: "Cancel",
        id: "cancelButton"
    });
    $.__views.mainWindow.leftNavButton = $.__views.cancelButton;
    $.__views.saveButton = Ti.UI.createButton({
        title: "Save",
        id: "saveButton"
    });
    $.__views.mainWindow.rightNavButton = $.__views.saveButton;
    $.__views.commentContent = Ti.UI.createTextArea({
        borderWidth: 2,
        borderColor: "#bbb",
        borderRadius: 5,
        top: "5dp",
        left: "5dp",
        right: "5dp",
        bottom: "240dp",
        font: {
            fontSize: "16dp"
        },
        suppressReturn: false,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: true,
        id: "commentContent"
    });
    $.__views.mainWindow.add($.__views.commentContent);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var parameters = arguments[0] || {};
    parameters.photo || {};
    parameters.parentController || {};
    var callbackFunction = parameters.callback || null;
    $.saveButton.addEventListener("click", handleButtonClicked);
    $.cancelButton.addEventListener("click", handleButtonClicked);
    $.mainWindow.addEventListener("open", handleWindowOpened);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;