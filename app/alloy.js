// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

//Alloy.Globals.Map = Ti.Android ? require('ti.map') : Ti.Map;

//
// Progress Indicator Functions
//
/**
 * shows progress indicator with progress bar for file download information
 *
 * @param {Object} messageString
 */
Alloy.Globals.showIndicator = function(_messageString) {
    if (OS_ANDROID) {
        progressIndicator = Titanium.UI.Android.createProgressIndicator({
            message : _messageString || "Loading, please wait.",
            location : Ti.UI.Android.PROGRESS_INDICATOR_DIALOG,
            type : Ti.UI.Android.PROGRESS_INDICATOR_INDETERMINANT,
            cancelable : false
        });
        progressIndicator.show();
        showingIndicator = true;
    } else {

        progressIndicatorWindow = Titanium.UI.createWindow({
            top : 0,
            left : 0,
            width : "100%",
            height : "100%",
            backgroundColor : "#58585A",
            opacity : .7
        });

        progressIndicator = Ti.UI.createProgressBar({
            top : "10dp",
            right : "30dp",
            bottom : "10dp",
            left : "30dp",
            min : 0,
            max : 1,
            message : _messageString || "Loading, please wait.",
            color : "white",
            font : {
                fontSize : 16,
                fontWeight : "bold"
            },
            style : 0
        });
        progressIndicatorWindow.add(progressIndicator);
        progressIndicatorWindow.open();
        progressIndicator.show();
        showingIndicator = true;

        // safety catch all to ensure the screen eventually clears
        // after 25 seconds
        setTimeout(function() {
            Alloy.Globals.hideIndicator();
        }, 35000);
    }
};

Alloy.Globals.setProgressValue = function (e) {
    progressIndicator && (progressIndicator.value = e.progress);
};


Alloy.Globals.hideIndicator = function() {
    if (!showingIndicator) {
        return;
    }
    progressIndicator.hide();
    if (OS_IOS) {
        progressIndicatorWindow.remove(progressIndicator);
        progressIndicatorWindow.close();
        progressIndicatorWindow = null;
    }

    // clean up variables
    showingIndicator = false;
    progressIndicator = null;
};