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

      if ($.tabGroup.activeTab.title === "Feed") {

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

// when we start up, create a user and log in
var user = Alloy.createModel('User');

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
