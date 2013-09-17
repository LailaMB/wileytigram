function Controller() {
    function loadComments() {
        var comments = Alloy.Collections.instance("Comment");
        if (_useCache && 0 !== comments.length) {
            $.commentTable.setData([]);
            comments.each(function(comment) {
                var commentRow = Alloy.createController("commentRow", comment);
                rows.push(commentRow.getView());
            });
            $.commentTable.data = rows;
            $.commentTable.editable = true;
            return;
        }
        var params = {
            photo_id: currentPhoto.id,
            order: "-created_at",
            per_page: 100
        };
        comments.fetch({
            data: params,
            success: function() {
                comments.each(function(comment) {
                    var commentRow = Alloy.createController("commentRow", comment);
                    rows.push(commentRow.getView());
                });
                $.commentTable.data = rows;
                $.commentTable.editable = true;
            },
            error: function(error) {
                alert("Error loading comments " + e.message);
                Ti.API.error(JSON.stringify(error));
            }
        });
    }
    function handleNewCommentButtonClicked() {
        var inputController = Alloy.createController("commentInput", {
            photo: currentPhoto,
            parentController: $,
            callback: inputCallback
        });
        inputController.getView().open({
            modal: true
        });
    }
    function inputCallback(_event) {
        _event.success ? addComment(_event.content) : alert("No Comment Added");
    }
    function addComment() {
        var comment = Alloy.createModel("Comment");
        var params = {
            photo_id: currentPhoto.id,
            content: _content,
            allow_duplicate: 1
        };
        comment.save(params, {
            success: function(_model, _response) {
                Ti.API.info("success: " + _model.toJSON());
                var rowController = Alloy.createController("commentRow", _model);
                if (0 === $.commentTable.getData().length) {
                    $.commentTable.setData([]);
                    $.commentTable.appendRow(rowController.getView(), true);
                } else $.commentTable.insertRowBefore(0, rowController.getView(), true);
                _callback && _callback({
                    success: true,
                    model: _response.model
                });
            },
            error: function(e) {
                Ti.API.error("error: " + e.message);
                _callback && _callback({
                    success: false,
                    model: {},
                    message: _e.message
                });
            }
        });
    }
    function handleDeleteRow(_event) {
        var collection = Alloy.Collections.instance("Comment");
        var model = collection.get(_event.row.comment_id);
        deleteComment(model, function(_response) {
            false === _response.success ? loadComments(null, true) : Ti.API.debug("deleted model ");
        });
    }
    function deleteComment(_comment, _callback) {
        debugger;
        _comment.destroy({
            photo_id: currentPhoto.id,
            id: _comment.id
        }, {
            success: function(_model, _response) {
                _callback && _callback({
                    success: true,
                    model: _response.model
                });
            },
            error: function(_e) {
                Ti.API.error("error: " + _e.message);
                _callback && _callback({
                    success: false,
                    model: null,
                    message: _e.message
                });
            }
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "comment";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.commentWindow = Ti.UI.createWindow({
        backgroundColor: "#fff",
        id: "commentWindow",
        title: "Comments"
    });
    $.__views.commentWindow && $.addTopLevelView($.__views.commentWindow);
    $.__views.newCommentButton = Ti.UI.createButton({
        title: "Comment",
        id: "newCommentButton"
    });
    $.__views.commentWindow.rightNavButton = $.__views.newCommentButton;
    $.__views.commentTable = Ti.UI.createTableView({
        id: "commentTable"
    });
    $.__views.commentWindow.add($.__views.commentTable);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var parameters = arguments[0] || {};
    var currentPhoto = parameters.photo || {};
    parameters.parentController || {};
    Alloy.Collections.instance("Comment");
    $.newCommentButton.addEventListener("click", handleNewCommentButtonClicked);
    $.commentTable.addEventListener("delete", handleDeleteRow);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;