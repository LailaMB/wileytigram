var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};
var callbackFunction = parameters.callback || null;

// EVENT LISTENERS
$.saveButton.addEventListener("click", handleButtonClicked);
$.cancelButton.addEventListener("click", handleButtonClicked);
$.mainWindow.addEventListener("open", handleWindowOpened); 

function handleWindowOpened(_event) {
    $.commentContent.focus();
}

function handleButtonClicked(_event) {
    // set default to false
    var returnParams = {
        success : false,
        content : null
    };

    // if saved, then set properties
    if (_event.source.id === "saveButton") {
        returnParams = {
            success : true,
            content : $.commentContent.value()
        };
    }

    // return to comment.js controller to add new comment
    callbackFunction && callbackFunction(returnParams);

    // give pause for animation
    setTimeout(function() {
        $.mainWindow.close();
    }, 200);
}
