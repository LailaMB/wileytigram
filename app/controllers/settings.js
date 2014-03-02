/* EVENT HANDLERS */
/* in IOS we need to support the button click */
OS_IOS && $.logoutBtn.addEventListener("click", handleLogoutBtnClick);

/* listen for click on image to uplaod a new one */
$.profileImage.addEventListener("click", handleProfileImageClick);

/* listen for close event to do some clean up */
$.getView().addEventListener("close", closeWindowEventHandler);

/* listen for android back event to do some clean up */
$.getView().addEventListener("androidback", androidBackEventHandler);

/* keep state of friends connections */
$.connectedToFriends = false;

/* keep state of initialization, this prevents the events from looping */
$.onSwitchChangeActive = false;

/**
 * this handles the click on the logout button in IOS and the click
 * on the menu button in android.
 *
 * @param {Object} _event
 */
$.handleLogoutMenuClick = function(_event) {
    handleLogoutBtnClick(_event);
};

/**
 * when the user logs out, remove them from social media connections,
 * push notifications and the ACS connection
 *
 * @param {Object} _event
 */
function handleLogoutBtnClick(argument) {

    // push logout
    require('pushNotifications').logout(function() {

        Alloy.Globals.currentUser.logout(function(_response) {
            if (_response.success) {
                Ti.API.debug('user logged out');

                // clear any twitter/FB information
                require('sharing').deauthorize();

                // show login window
                $.parentController.userNotLoggedInAction();

            } else {
                Ti.API.error('error logging user out');
            }
        });
    });
}

function handleProfileImageClick(argument) {
}

function closeWindowEventHandler(argument) {
}

function androidBackEventHandler(argument) {
}

