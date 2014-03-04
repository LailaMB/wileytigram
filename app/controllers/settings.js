/* EVENT HANDLERS */
/* in IOS we need to support the button click */
OS_IOS && $.logoutBtn.addEventListener("click", handleLogoutBtnClick);

/* listen for click on image to uplaod a new one */
$.profileImage.addEventListener("click", handleProfileImageClick);

/* listen for close event to do some clean up */
$.getView().addEventListener("close", closeWindowEventHandler);

/* listen for android back event to do some clean up */
$.getView().addEventListener("androidback", androidBackEventHandler);

/* listen for click on refreshBtn to refresh data */
$.refreshBtn.addEventListener("click", loadProfileInformation);


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

/**
 * change the user's custom profile photo by clicking on the
 * existing photo
 */
function handleProfileImageClick() {
    var dopts = {
        options : ['Take Photo', 'Open Photo Gallery'],
        title : 'Pick Photo Source'
    };

    if (OS_IOS) {
        dopts.options.push('Cancel');
        dopts.cancel = dopts.options.length - 1;
    } else {
        dopts.buttonNames = ['Cancel'];
    }
    var optionDialog = Ti.UI.createOptionDialog(dopts);

    optionDialog.addEventListener('click', function(e) {
        var options = {
            success : processPhoto,
            cancel : function() {
            },
            error : function(e) {
                Ti.API.error(JSON.stringify(e));
            },
            allowEditing : true,
            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
        };
        if (e.button) {
            return;
        } else if (e.index == 0) {
            Ti.Media.showCamera(options);
        } else if (e.index == 1) {
            Ti.Media.openPhotoGallery(options);
        }

    });

    optionDialog.show();
}

function processPhoto(_event) {

    Alloy.Globals.PW.showIndicator("Saving Image");
    var ImageFactory = require('ti.imagefactory');

    if (OS_ANDROID || _event.media.width > 700) {
        var w, h;
        w = _event.media.width * .50;
        h = _event.media.height * .50;
        $.currentUserCustomPhoto = ImageFactory.imageAsResized(_event.media, {
            width : w,
            height : h
        });
    } else {
        // we do not need to compress here
        $.currentUserCustomPhoto = _event.media;
    }

    Alloy.Globals.currentUser.save({
        "photo" : $.currentUserCustomPhoto,
        "photo_sizes[thumb_100]" : "100x100#",
        // We need this since we are showing the image immediately
        "photo_sync_sizes[]" : "thumb_100",
    }, {
        success : function(_model, _response) {

            // take the cropped thumb and display it
            setTimeout(function() {

                // give ACS some time to process image then get updated
                // user object
                Alloy.Globals.currentUser.showMe(function(_resp) {
                    Alloy.Globals.PW.hideIndicator();

                    _resp.model && (Alloy.Globals.currentUser = _resp.model);
                    if (_resp.model.attributes.photo.processed) {
                        $.profileImage.image = _resp.model.attributes.photo.urls.thumb_100;
                        alert("Your profile photo has been changed.");
                    } else {
                        $.profileImage.image = _resp.model.attributes.photo.urls.original;

                        alert("Your profile photo has been changed, thumbnail process not complete!");
                        // clear out values force refresh on next focus if we
                        // still dont have an image
                        $.currentUserCustomPhoto = null;
                        $.initialized = false;
                    }

                });
            }, 3000);
        },
        error : function(error) {
            Alloy.Globals.PW.hideIndicator();
            alert("An error occurred while trying to save your profile " + String(error));
            Ti.API.error(error);
            return;
        }
    });
}

function loadProfileInformation() {
    Alloy.Globals.PW.showIndicator("Loading Profile Information");

    // get the attributes from the current user
    var attributes = Alloy.Globals.currentUser.attributes;
    var currentUser = Alloy.Globals.currentUser;

    if (attributes.firstName && attributes.lastName) {
        $.fullname.text = attributes.firstName + " " + attributes.lastName;
    } else {
        $.fullname.text = attributes.username;
    }

    Ti.API.debug(JSON.stringify(Alloy.Globals.currentUser, null, 2));

    // set the user profile photo
    if ($.currentUserCustomPhoto) {
        $.profileImage.image = $.currentUserCustomPhoto;
    } else if (attributes.photo && attributes.photo.urls) {
        $.profileImage.image = attributes.photo.urls.thumb_100 || attributes.photo.urls.original;
    } else if ( typeof (attributes.external_accounts) !== "undefined") {
        $.profileImage.image = 'https://graph.facebook.com/' + attributes.username + '/picture';
    } else {
        Ti.API.debug('no photo using missing gif');
        $.profileImage.image = '/missing.gif';
    }

    currentUser.showMe(function(_response) {
        if (_response.success) {
            $.photoCount.text = _response.model.get("stats").photos.total_count;
        } else {
            alert("Error getting user information");
        }

        // get the friends count
        currentUser.getFriends(function(_response2) {
            if (_response2.success) {
                $.friendCount.text = _response2.collection.length;
            } else {
                alert("Error getting user friend information");
            }

            Alloy.Globals.PW.hideIndicator();
        });
    });
}

function closeWindowEventHandler(argument) {
}

function androidBackEventHandler(argument) {
}

// we need to fetch the content when the view gains focus NOT on open
// this will ensure the content is refreshed
$.getView().addEventListener("focus", function() {
    setTimeout(function() {
        !$.initialized && loadProfileInformation();
        $.initialized = true;
    }, 200);
});
