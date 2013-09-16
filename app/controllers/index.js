// when we start up, create a user and log in
var user = Alloy.createModel('User');

// we are using the default administration account for now
user.login("wileytigram_admin", "wileytigram_admin", function(_response) {
	if (_response.success) {
		// open the main screen
		$.index.open();

		// pre-populate the feed with recent photos
		$.feedController.initialize();

	} else {
		alert("Error Starting Application " + _response.error);
		Ti.API.error('error logging in ' + _response.error);
	}
});
$.index.open(); 