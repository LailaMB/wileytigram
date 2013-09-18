// Get the parameters passed into the controller
var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};
var callbackFunction = parameters.callback || null;

// EVENT LISTENERS
$.saveButton && $.saveButton.addEventListener("click", handleButtonClicked);
$.cancelButton && $.cancelButton.addEventListener("click", handleButtonClicked);
$.mainWindow.addEventListener("open", handleWindowOpened); 

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
 * set the focus on the text area after the window opens so the users
 * can start typing without selecting the text area first
 *
 * @param {Object} _event
 */
function handleWindowOpened(_event) {
    $.commentContent.focus();
}

// Setup the menus for Android if necessary
function doOpen() {
    OS_ANDROID && ($.getView().activity.onCreateOptionsMenu = function(_event) {
        var activity = $.getView().activity;
        var actionBar = activity.actionBar;
        if (actionBar) {
            actionBar.displayHomeAsUp = true;
            actionBar.onHomeIconItemSelected = function() {
                $.getView().close();
            };
        } else {
            alert("No Action Bar Found");
        }

        /**
         * add the button to the titlebar
         */
        //Add a title to the tabgroup. We could also add menu items here if needed
        Ti.API.info('IN onCreateOptionsMenu commentInput.js');
        
        var menuItem = _event.menu.add({
            id : "saveButton",
            title : "Save Comment",
            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
        });
        menuItem.addEventListener("click", function(_event) {
            _event.source.id = "saveButton",
            handleButtonClicked(_event);
        });
    });
};