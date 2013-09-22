// Get the parameters passed into the controller
var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};
var callbackFunction = parameters.callback || null;

// EVENT LISTENERS
OS_IOS && $.saveButton.addEventListener("click", handleButtonClicked);
OS_IOS && $.cancelButton.addEventListener("click", handleButtonClicked);

$.getView().addEventListener("close", closeWindowEventHandler);
$.getView().addEventListener("androidback", androidBackEventHandler);

//
// EVENT METHODS
//
function closeWindowEventHandler() {
    Ti.API.debug("closing window");
    $.getView().removeEventListener("close", closeWindowEventHandler);
}

function androidBackEventHandler(_event) {
    _event.cancelBubble = true;
    _event.bubbles = false;
    Ti.API.debug("androidback event");
    $.getView().removeEventListener("androidback", androidBackEventHandler);

    // if back button is hit then it is the same as cancelling input
    handleButtonClicked({});
}

/**
 * user selected save, take the content and send it back to be saved
 * user selected cancel, send false and null for content
 * with the photo as a comment
 *
 * @param {Object} _event
 */
function handleButtonClicked(_event) {
    // set default to false
    var returnParams = {
        success : false,
        content : null
    };

    // if saved, then set properties
    if (_event.source && (_event.source.id === "saveButton")) {
        returnParams = {
            success : true,
            content : $.commentContent.value
        };
    }

    callbackFunction && callbackFunction(returnParams);

    // give pause for animation
    setTimeout(function() {
        $.mainWindow.close();
    }, 200);
}

/**
 * Setup the menus for Android if necessary
 *
 * set the focus to the input field
 */
function doOpen() {
    if (OS_ANDROID) {

        $.getView().activity.onCreateOptionsMenu = function(_event) {

            var activity = $.getView().activity;
            var actionBar = $.getView().activity.actionBar;

            if (actionBar) {
                actionBar.displayHomeAsUp = true;
                actionBar.onHomeIconItemSelected = function() {
                    $.getView().close();
                };
            } else {
                alert("No Action Bar Found");
            }

            // add the button to the titlebar
            var mItemSave = _event.menu.add({
                id : "saveButton",
                title : "Save Comment",
                showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                icon : Ti.Android.R.drawable.ic_menu_save
            });

            // add save menu item
            mItemSave.addEventListener("click", function(_event) {
                _event.source.id = "saveButton";
                handleButtonClicked(_event);
            });

            var mItemCancel = _event.menu.add({
                id : "cancelButton",
                title : "Cancel",
                showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                icon : Ti.Android.R.drawable.ic_menu_close_clear_cancel
            });

            // add cancel menu item
            mItemCancel.addEventListener("click", function(_event) {
                _event.source.id = "cancelButton";
                handleButtonClicked(_event);
            });
        };

    }

    // set focus to the text imput field, but
    // use set time out to give window thme to draw
    setTimeout(function() {
        $.commentContent.focus();
    }, 350);

};