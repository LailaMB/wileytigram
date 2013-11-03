//
// Progress Indicator Functions
//

var activityIndicator, showingIndicator, activityIndicatorWindow, progressTimeout;
var progressIndicator = null;
/**
 * shows progress indicator with progress bar for file download information
 *
 * @param {Object} messageString
 */
exports.showIndicator = function(_messageString) {
    Ti.API.info('showIndicator: ' + _messageString);

    activityIndicatorWindow = Titanium.UI.createWindow({
        top : 0,
        left : 0,
        width : "100%",
        height : "100%",
        backgroundColor : "#58585A",
        opacity : .7
    });

    activityIndicator = Ti.UI.createActivityIndicator({
        style : OS_IOS ? Ti.UI.iPhone.ActivityIndicatorStyle.DARK : Ti.UI.ActivityIndicatorStyle.DARK,
        top : "10dp",
        right : "30dp",
        bottom : "10dp",
        left : "30dp",
        message : _messageString || "Loading, please wait.",
        color : "white",
        font : {
            fontSize : 16,
            fontWeight : "bold"
        },
        style : 0
    });
    activityIndicatorWindow.add(activityIndicator);
    activityIndicatorWindow.open();
    activityIndicator.show();
    showingIndicator = true;

    // safety catch all to ensure the screen eventually clears
    // after 25 seconds
    progressTimeout = setTimeout(function() {
        exports.hideIndicator();
    }, 35000);
};

exports.setProgressValue = function(e) {
    progressIndicator && (progressIndicator.value = e.progress);
};

exports.hideIndicator = function() {

    if (progressTimeout) {
        clearTimeout(progressTimeout);
        progressTimeout = null;
    }

    Ti.API.info('hideIndicator');
    if (!showingIndicator) {
        return;
    }
    activityIndicator.hide();
    if (OS_IOS) {
        activityIndicatorWindow.remove(activityIndicator);
        activityIndicatorWindow.close();
        activityIndicatorWindow = null;
    }

    // clean up variables
    showingIndicator = false;
    activityIndicator = null;
};
