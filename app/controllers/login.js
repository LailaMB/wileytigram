var args = arguments[0] || {};

// Using FB module in the latest release of Appcelerator
Alloy.Globals.FB = require('facebook');

// need access to the parent object
$.parentController = args.parentController;

// events
$.showLoginBtn.addEventListener('click', showLoginBtnClicked);
$.showCreateAccountBtn.addEventListener('click', showCreateAccountBtnClicked);
$.cancelCreateAcctBtn.addEventListener('click', cancelActionButtonClicked);
$.cancelLoginBtn.addEventListener('click', cancelActionButtonClicked);

$.doLoginBtn.addEventListener('click', doLoginBtnClicked);
$.doCreateAcctBtn.addEventListener('click', doCreateAcctBtnClicked);

$.showLoginFBBtn.addEventListener('click', doFacebookLoginAction);
// EVENT HANDLERS
/**
 *
 */
function showLoginBtnClicked() {
	$.create_acct_view.hide();
	$.home_view.hide();
	$.login_view.show();
};

/**
 *
 */
function showCreateAccountBtnClicked() {
	$.create_acct_view.show();
	$.home_view.hide();
	$.login_view.hide();
};

/**
 *
 */
function cancelActionButtonClicked() {
	$.create_acct_view.hide();
	$.login_view.hide();

	// set the global login state to false
	Alloy.Globals.loggedIn = false;

	// display only the home state view
	$.home_view.show();
};

function userActionResponseHandler(_resp) {
	if (_resp.success === true) {

		// Do stuff after successful login.
		Alloy.Globals.loggedIn = true;
		Alloy.Globals.CURRENT_USER = _resp.model;

		$.parentController.loginSuccessAction(_resp);

	} else {
		// Show the error message and let the user try again.
		alert("loginFailed", _resp.error.message);

		Alloy.Globals.CURRENT_USER = null;
		Alloy.Globals.loggedIn = false;
	}
};

/**
 *
 */
function doLoginBtnClicked() {

	var user = Alloy.createModel('User');

	user.login($.email.value, $.password.value, userActionResponseHandler);
};

function doCreateAcctBtnClicked() {
	if ($.acct_password.value !== $.acct_password_confirmation.value) {
		alert("Please re-enter information");
		return;
	}

	var params = {
		first_name : $.acct_fname.value,
		last_name : $.acct_lname.value,
		username : $.acct_email.value,
		email : $.acct_email.value,
		password : $.acct_password.value,
		password_confirmation : $.acct_password_confirmation.value,
	};

	var user = Alloy.createModel('User');

	user.createAccount(params, userActionResponseHandler);
};

/**
 *
 * @param {Object} _event
 */
function faceBookLoginEventHandler(_event) {

	Alloy.Globals.FB.removeEventListener('login', faceBookLoginEventHandler);

	if (_event.success) {
		doFacebookLoginAction(_event.data);
	} else if (_event.error) {
		alert(_event.error);
	} else {
		_event.cancelled && alert("User Canceled");
	}
};

function faceBookLoginErrorHandler(_user, _error) {
	// Show the error message somewhere and let the user try again.
	alert("Error: " + _error.code + " " + _error.message);

	Alloy.Globals.loggedIn = false;
	Alloy.Globals.CURRENT_USER = null;
};

/**
 *
 * @param {Object} _options data from FB login
 */
function doFacebookLoginAction(_options) {
	var FB = Alloy.Globals.FB;

	if (FB.loggedIn === false) {

		FB.logout();

		/// Enabling single sign on using FB
		FB.forceDialogAuth = false;

		// get the app id
		FB.appid = Ti.App.Properties.getString("ti.facebook.appid");

		// set permissions
		FB.permissions = ["read_stream"];

		// login handler with callback
		FB.addEventListener("login", faceBookLoginEventHandler);

		// attempt to authorize user
		FB.authorize();

	} else {
		var user = Alloy.createModel('User');
		user.updateFacebookLoginStatus(FB.accessToken, {
			success : function(_resp) {

				Ti.App.Properties.setString("loginType", "FACEBOOK");

				Alloy.Globals.loggedIn = true;
				Alloy.Globals.CURRENT_USER = _resp.model;

				// save the newly created facebook user
				if (!_resp.model.get("username") && _options.email) {
					_resp.model.save({
						"email" : _options.email,
						"username" : _options.email
					}, {
						success : function(_user, _response) {
							$.parentController.loginSuccessAction(_resp);

							Alloy.Globals.CURRENT_USER = _user;
						},
						error : faceBookLoginErrorHandler
					});
				} else {
					$.parentController.loginSuccessAction(_resp);
				}
			},
			error : faceBookLoginErrorHandler
		});
	}
}

/**
 * if reset is true then set the UI back to option page
 * where the user can select the desired login method
 */
$.open = function(_reset) {

	// reset the UI
	if (_reset) {
		cancelActionButtonClicked();
	}
	$.index.open();
};
/**
 * close the window/controller, do some clean up here
 * if needed
 */
$.close = function() { debugger;
	$.index.close();
};
