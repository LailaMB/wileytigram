var args = arguments[0] || {};

// need access to the parent object
$.parentController = args.parentController;

$.showLoginBtn.addEventListener('click', showLoginBtnClicked);
$.showCreateAccountBtn.addEventListener('click', showCreateAccountBtnClicked);
$.cancelCreateAcctBtn.addEventListener('click', cancelActionButtonClicked);
$.cancelLoginBtn.addEventListener('click', cancelActionButtonClicked);

$.doLoginBtn.addEventListener('click', doLoginBtnClicked);
$.doCreateAcctBtn.addEventListener('click', doCreateAcctBtnClicked);

function showLoginBtnClicked() {
    $.create_acct_view.hide();
    $.home_view.hide();
    $.login_view.show();
};

function showCreateAccountBtnClicked() {
    $.create_acct_view.show();
    $.home_view.hide();
    $.login_view.hide();
};

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
