// Get the parameters passed into the controller
var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};

var comments = Alloy.Collections.instance("Comment");

$.newCommentButton.addEventListener("click", handleNewCommentButtonClicked);
$.commentTable.addEventListener("delete", handleDeleteRow);

function loadComments() {

	// creates or gets the global instance of comment collection
	var comments = Alloy.Collections.instance("Comment");

	if (_useCache && comments.length !== 0) {
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
		photo_id : currentPhoto.id,
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
		modal : true
	});

};

function inputCallback(_event) {
	if (_event.success) {
		addComment(_event.content);
	} else {
		alert("No Comment Added");
	}
};

function addComment() {
	var comment = Alloy.createModel('Comment');
	var params = {
		photo_id : currentPhoto.id,
		content : _content,
		allow_duplicate : 1
	};

	comment.save(params, {

		success : function(_model, _response) {
			Ti.API.info('success: ' + _model.toJSON());
			var rowController = Alloy.createController("commentRow", _model);

			// add the controller view, which is a row to the table
			if ($.commentTable.getData().length === 0) {
				$.commentTable.setData([]);
				$.commentTable.appendRow(rowController.getView(), true);
			} else {
				$.commentTable.insertRowBefore(0, rowController.getView(), true);
			}

			_callback && _callback({
				success : true,
				model : _response.model
			});

		},
		error : function(e) {
			Ti.API.error('error: ' + e.message);
			_callback && _callback({
				success : false,
				model : {},
				message : _e.message
			});
		}
	});

};

function handleDeleteRow(_event) {

	// _event.row.comment_id
	var collection = Alloy.Collections.instance("Comment");
	var model = collection.get(_event.row.comment_id);

	deleteComment(model, function(_response) {
		// on error, reload the table
		if (_response.success === false) {
			loadComments(null, true);
		} else {
			Ti.API.debug('deleted model ');
		}
	});

}

function deleteComment(_comment, _callback) { debugger;

	_comment.destroy({
		photo_id : currentPhoto.id, // photo associated w/comment
		id : _comment.id // id of the comment object
	}, {
		success : function(_model, _response) {

			_callback && _callback({
				success : true,
				model : _response.model
			});

		},
		error : function(_e) {
			Ti.API.error('error: ' + _e.message);
			_callback && _callback({
				success : false,
				model : null,
				message : _e.message
			});
		}
	});
}


