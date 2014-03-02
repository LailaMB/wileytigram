// Global Functions

/**
 * open the window using the tabGroup so we get the back button
 * functionality and all of the nav bar goodness
 *
 * @param {Object} _window
 */
Alloy.Globals.openCurrentTabWindow = function(_window) {
    $.tabGroup.activeTab.open(_window);
};

// setting the UI for Android Applications
/**
 * on the open event of the tabGroup, setup the menu and add an
 * event listener that will reset the menus when the active tab
 * changes.
 *
 * This allows each tab window to have a unique set of menus in
 * the actionBar
 */
function doOpen() {

    if (OS_ANDROID) {
        //Add a title to the tabgroup. We could also add menu items here if
        // needed
        var activity = $.getView().activity;
        var menuItem = null;

        activity.onCreateOptionsMenu = function(e) {

            Ti.API.info('IN activity.onCreateOptionsMenu');
            Ti.API.info('Active Tab: ' + $.tabGroup.activeTab.title);

            if ($.tabGroup.activeTab.title === "Settings") {
                menuItem = e.menu.add({
                    title : "Logout",
                    showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                });
                menuItem.addEventListener("click", function(e) {
                    $.settingsController.handleLogoutMenuClick();
                });
            } else if ($.tabGroup.activeTab.title === "Feed") {

                menuItem = e.menu.add({
                    //itemId : "PHOTO",
                    title : "Take Photo",
                    showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                    icon : Ti.Android.R.drawable.ic_menu_camera
                });

                menuItem.addEventListener("click", function(e) {
                    $.feedController.cameraButtonClicked();
                });
            } else {
                // No Menu Buttons
            }
        };

        activity.invalidateOptionsMenu();

        // this forces the menu to update when the tab changes
        $.tabGroup.addEventListener('blur', function(_event) {
            $.getView().activity.invalidateOptionsMenu();
        });
    }
}

$.userLoggedInAction = function() {
    user.showMe(function(_response) {
        if (_response.success === true) {
            indexController.loginSuccessAction(_response);
        } else {
            alert("Application Error\n " + _response.error.message);
            Ti.API.error(JSON.stringify(_response.error, null, 2));

            // go ahead and do the login
            $.userNotLoggedInAction();
        }
    });
};

$.loginSuccessAction = function(_options) {
    initializePushNotifications(_options.model);

    Ti.API.info('logged in user information');
    Ti.API.info(JSON.stringify(_options.model, null, 2));

    // open the main screen
    $.tabGroup.open();

    // set tabGroup to initial tab, incase this is coming from
    // a previously logged in state
    $.tabGroup.setActiveTab(0);

    // pre-populate the feed with recent photos
    $.feedController.initialize();

    // get the current user
    Alloy.Globals.currentUser = _options.model;

    // set the parent controller for all of the tabs, give us
    // access to the global tab group and misc functionality
    $.feedController.parentController = indexController;
    $.friendsController.parentController = indexController;
    $.settingsController.parentController = indexController;

    // do any necessary cleanup in login controller
    $.loginController && $.loginController.close();
};

$.userNotLoggedInAction = function() {

    // open the login controller to login the user
    if ($.loginController === null) {
        $.loginController = Alloy.createController("login", {
            parentController : indexController,
            reset : true
        });
    }

    // open the window
    $.loginController.open(true);

};

// when we start up, create a user and log in
var user = Alloy.createModel('User');
var indexController = $;
$.loginController = null;

if (user.authenticated() === true) {
    $.userLoggedInAction();
} else {
    $.userNotLoggedInAction();
}

/*
 // we are using the default administration account for now
 user.login("wileytigram_admin", "wileytigram_admin", function(_response) {
 if (_response.success) {
 // open the main screen
 $.tabGroup.open();

 // pre-populate the feed with recent photos
 $.feedController.initialize();

 } else {
 alert("Error Starting Application " + _response.error);
 Ti.API.error('error logging in ' + _response.error);
 }
 });
 */

function initializePushNotifications(_user) {

    Alloy.Globals.pushToken = null;
    var pushLib = require('pushNotifications');

    // initialize PushNotifications
    pushLib.initialize(_user,
    // notification received callback
    function(_pushData) {
        Ti.API.info('I GOT A PUSH NOTIFICATION');
        // get the payload from the proper place depending
        // on what platform you are on
        var payload;

        try {
            if (_pushData.payload) {
                payload = JSON.parse(_pushData.payload);
            } else {
                payload = _pushData;
            }
        } catch(e) {
            payload = {};
        }

        // display the information in an alert
        if (OS_ANDROID) {
            Ti.UI.createAlertDialog({
                title : payload.android.title || "Alert",
                message : payload.android.alert || "",
                buttonNames : ['Ok']
            }).show();
        } else {
            Ti.UI.createAlertDialog({
                title : "Alert",
                message : payload.alert || "",
                buttonNames : ['Ok']
            }).show();
        }

    },
    // registration callback parameter
    function(_pushInitData) {
        if (_pushInitData.success) {
            // save the token so we know it was initialized
            Alloy.Globals.pushToken = _pushInitData.data.deviceToken;
        } else {
            alert("Error Initializing Push Notifications");
            Alloy.Globals.pushToken = null;
        }
    });
}
