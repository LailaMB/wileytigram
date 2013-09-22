// Get the parameters passed into the controller
var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};

var comments = Alloy.Collections.instance("Comment");

$.newCommentButton && $.newCommentButton.addEventListener("click", handleNewCommentButtonClicked);
$.commentTable.addEventListener("delete", handleDeleteRow);
$.commentTable.addEventListener("longpress", handleDeleteRow);
$.commentTable.editable = true;

function loadComments(_photo_id) {
    var rows = [];

    // creates or gets the global instance of comment collection
    var comments = Alloy.Collections.instance("Comment");

    var params = {
        photo_id : _photo_id || currentPhoto.id,
        order : '-created_at',
        per_page : 100
    };

    comments.fetch({
        data : params,
        success : function(model, response) {
            comments.each(function(comment) {
                var commentRow = Alloy.createController("commentRow", comment);
                rows.push(commentRow.getView());
            });
            // set the table rows
            $.commentTable.data = rows;
            $.commentTable.editable = true;
        },
        error : function(error) {
            alert('Error loading comments ' + e.message);
            Ti.API.error(JSON.stringify(error));
        }
    });
};

function handleNewCommentButtonClicked(_event) {

    var inputController = Alloy.createController("commentInput", {
        photo : currentPhoto,
        parentController : $,
        callback : inputCallback
    });

    // open the view
    inputController.getView().open({
        modal : OS_ANDROID ? false : true
    });

};

function inputCallback(_event) {
    if (_event.success) {
        addComment(_event.content);
    } else {
        alert("No Comment Added");
    }
};

function addComment(_content, _callback) {
    var comment = Alloy.createModel('Comment');
    var params = {
        photo_id : currentPhoto.id,
        content : _content,
        allow_duplicate : 1
    };

    comment.save(params, {

        success : function(_model, _response) {
            Ti.API.info('success: ' + _model.toJSON());
            var row = Alloy.createController("commentRow", _model);

            // add the controller view, which is a row to the table
            if ($.commentTable.getData().length === 0) {
                $.commentTable.setData([]);
                $.commentTable.appendRow(row.getView(), true);
            } else {
                $.commentTable.insertRowBefore(0, row.getView(), true);
            }
        },
        error : function(e) {
            Ti.API.error('error: ' + e.message);
            alert('Error saving new comment ' + e.message);
        }
    });

};

function handleDeleteRow(_event) {
    Ti.API.debug(JSON.stringify(_event.row.comment_id, null, 1));

    // _event.row.comment_id
    var collection = Alloy.Collections.instance("Comment");
    var model = collection.get(_event.row.comment_id);

    if (!model) {
        alert("Could not find selected comment");
        return;
    } else {
        var optionAlert = Titanium.UI.createAlertDialog({
            title : 'Alert',
            message : 'Are You Sure You Want to Delete the Comment',
            buttonNames : ['Yes', 'No']
        });

        optionAlert.addEventListener('click', function(e) {
            if (e.index == 0) {
                Ti.API.debug(JSON.stringify(model, null, 1));

                model.destroy({
                    data : {
                        photo_id : currentPhoto.id, // photo associated w/comment
                        id : model.id // id of the comment object
                    },
                    success : function(_model, _response) {
                        loadComments(null);
                    },
                    error : function(_e) {
                        Ti.API.error('error: ' + _e.message);
                        alert("Error deleteing comment");
                        loadComments(null);
                    }
                });
            }
        });
        optionAlert.show();
    }
}

function closeWindowEventHandler() {
    Ti.API.debug("closing window");
    $.getView().removeEventListener("close", closeWindowEventHandler);
}

function androidBackEventHandler(_event) {
    _event.cancelBubble = true;
    _event.bubbles = false;
    Ti.API.debug("androidback event");
    $.getView().removeEventListener("androidback", androidBackEventHandler);
    $.getView().close();
}

// Setup the menus for Android if necessary
function doOpen() {
    Ti.API.info("OS_ANDROID " + OS_ANDROID);
    Ti.API.info("OS_IOS " + OS_IOS);
    if (OS_ANDROID === true) {

        $.getView().activity.onCreateOptionsMenu = function(_event) {

            var activity = $.getView().activity;
            var actionBar = activity.actionBar;
            var menuItem = null;

            Ti.API.info('in onCreateOptionsMenu comment.js');

            if (actionBar) {
                actionBar.displayHomeAsUp = true;
                actionBar.onHomeIconItemSelected = function() {
                    $.getView().close();
                };
            }

            // add the button/menu to the titlebar
            menuItem = _event.menu.add({
                title : "New Comment",
                showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
                icon : Ti.Android.R.drawable.ic_menu_add
            });

            // event listener
            menuItem.addEventListener("click", function(e) {
                handleNewCommentButtonClicked();
            });

        };
    } else {
        Ti.API.debug('not in android, nothing to do in doOpen');
    }
};

/**
 *
 */
$.initialize = function() {
    loadComments();
};

