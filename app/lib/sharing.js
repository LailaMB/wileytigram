// if facebook not loaded, then load it
if (!Alloy.Globals.FB) {
	Alloy.Globals.FB = require('facebook');

	// Enabling single sign on using FB
	Alloy.Globals.FB.forceDialogAuth = false;

	// get the app id
	Alloy.Globals.FB.appid = Ti.App.Properties.getString("ti.facebook.appid");
}

// if twitter is not loaded/initialized
if (!Alloy.Globals.TW) {
    var social = require('social');

    // Create a Twitter client for this module
              var TAP = Ti.App.Properties;
    Alloy.Globals.TW = social.create({
        consumerSecret :TAP.getString('twitter.consumerSecret'),
        consumerKey : TAP.getString('twitter.consumerKey')
    });

}


// variables for the progress indicators
var progressIndicatorWindow = null;
var showingIndicator = false;
var progressIndicator = null;

exports.sharingOptions = function(_options) {

	var dialog = Titanium.UI.createOptionDialog({
		options : ['FB Feed', 'FB Photo', 'Twitter', 'Email', 'Cancel'],
		cancel : 4,
		title : 'Share Photo'
	});

	// add event listener
	dialog.addEventListener('click', function(e) {

		if (e.index === 0) {
			prepForFacebookShare(function() {
				shareWithFacebookDialog(_options.model);
			});
		} else if (e.index === 1) {
			prepForFacebookShare(function() {
				shareFacebookPhoto(_options.model);
			});
		} else if (e.index === 2) {
            shareTwitterPhoto(_options.model);
		} else {
			shareWithEmailDialog(_options.model);
		}
	});

	// show the dialog
	dialog.show();

};

function shareWithFacebookDialog(_model) {

	var data = {
		link : _model.attributes.urls.original,
		name : "tiGram Wiley Sample App",
		message : " ACS Alloy Sample App and the photo",
		caption : _model.attributes.title,
		picture : _model.attributes.urls.preview,
		description : "None"
	};

	Alloy.Globals.FB.dialog("feed", data, function(e) {
		if (e.success && e.result) {
			alert("Success!");
		} else {
			if (e.error) {
				alert(e.error);
			} else {
				alert("User canceled dialog.");
			}
		}
	});
}

function prepForFacebookShare(_callback) {

	var FB = Alloy.Globals.FB;

	var loginCB = function(e) {
		if (e.success) {
			prepForFacebookShare(_callback);
		} else if (e.error) {
			alert(e.error);
		}
		// remove event listener now that we are done
		FB.removeEventListener('login', loginCB);
		return;
	};

	// if not logged in then log user in and then try again
	if (!FB.loggedIn) {
		FB.addEventListener('login', loginCB);
		FB.authorize();
	} else {

		// First make sure this permission exists
		FB.reauthorize(['publish_stream'], 'everyone', function(e) {
			if (e.success) {
				_callback();
			} else {
				alert('Authorization failed: ' + e.error);
			}
		});
	}
}

function downloadFile(url, _path, _callback, _progress) {
	Alloy.Globals.PW.showIndicator("downloading file");
	_path && Ti.API.debug("downloading " + url + "  as " + _path);

	var f, fd, http;

	http = Ti.Network.createHTTPClient({
		ondatastream : function(e) {
			// update the caller with information on download
			_progress && _progress(e);
		}
	});

	http.open("GET", url);

	http.onload = function() {

		if (_path) {
			if (Ti.Filesystem.isExternalStoragePresent()) {
				fd = Ti.Filesystem.externalStorageDirectory;
			} else {
				// No SD or iOS
				fd = Ti.Filesystem.applicationDataDirectory;
			}

			// get the file
			f = Ti.Filesystem.getFile(fd, _path);

			// delete if already exists
			if (f.exists()) {
				f.deleteFile();
				f = Ti.Filesystem.getFile(fd, _path);
			}

			// write blob to file
			f.write(http.responseData);
			Alloy.Globals.PW.hideIndicator(); 

			_callback && _callback({
				success : true,
				nativePath : f.nativePath
			});

		} else {
			Alloy.Globals.PW.hideIndicator(); 
			// if no path, the just return the blob
			_callback && _callback({
				success : true,
				nativePath : null,
				blob : http.responseData
			});
		}

	};
	// if error return information
	http.onerror = function(e) {
		Alloy.Globals.PW.hideIndicator(); 
		_callback && _callback({
			success : false,
			nativePath : null,
			error : e
		});

	};

	http.send();
};

function shareFacebookPhoto(_model) {

    var dataModel = _model.attributes;
    var msg;

    // get image as blob, null passed for _path
    downloadFile(dataModel.urls.original, null, function(_data) {

        if (_data.success === false) {
            alert("error downloading file for sharing");
            return;
        }

        msg = dataModel.title;
        msg += "\nfrom ACS & Alloy Sample App";

        var data = {
            message : msg,
            picture : _data.blob,
        };

        // Now post the downloaded photo
        Alloy.Globals.FB.requestWithGraphPath('me/photos', data,
           'POST', function(e) {
            if (e.success) {
                alert("Success!  From Facebook: " + e.result);
            } else {
                if (e.error) {
                    alert(e.error);
                } else {
                    alert("Unknown result");
                }
            }
        });
    });
};

function shareWithEmailDialog(_model) {

    var dataModel = _model.attributes;

    var emailDialog = Ti.UI.createEmailDialog({
        html : true
    });

    if (emailDialog.isSupported() === false) {
        alert("Email is not configured for this device");
        return;
    }

    emailDialog.subject = " Wiley ACS & Alloy Sample App";
    emailDialog.messageBody = '<html>' + dataModel.title +'<br/>';
    emailDialog.messageBody +='<a href="' +dataModel.urls.original;
    emailDialog.messageBody += '">Link to original image</a>';
    emailDialog.messageBody += '</html>';

    downloadFile(_model.attributes.urls.original, "temp.jpeg",   
        function(_data) {

        if (_data.success === false) {
            alert("Error downloading file\n Image not shared!");
            return;
        }

        var f = Ti.Filesystem.getFile(_data.nativePath);
        emailDialog.addAttachment(f);

        emailDialog.addEventListener("complete", function(_event) {
            if (e.result === emailDialog.SENT) {
                alert('Message Successfully Sent!');
            }
        });

        emailDialog.open();

    });
};

function shareTwitterPhoto(_model) {
    var dataModel = _model.attributes;

    var twitter = Alloy.Globals.TW;

    downloadFile(dataModel.urls.iphone, null, function(_data) {

        if (_data.success === false) {
            alert("error downloading file");
            return;
        }
        twitter.shareImage({
            message : dataModel.title + " #tialloy",
            image : _data.blob,
            success : function() {
                Ti.UI.createAlertDialog({
                    title : 'Sample Alloy & ACS App',
                    message : "Tweeted successfully!",
                    buttonNames : ['OK']
                }).show();
            },
            error : function(_response) {
                var error = JSON.parse(_response).error;
                Ti.UI.createAlertDialog({
                    title : 'Sample Alloy & ACS App',
                    message : 'Unable to post your tweet.\n' + error,
                    buttonNames : ['OK']
                }).show();
            }
        });
    });
}

/**
 * logs out and clears out any social media information
 */
exports.deauthorize = function() {
    Alloy.Globals.TW && Alloy.Globals.TW.deauthorize();
    Alloy.Globals.FB && Alloy.Globals.FB.logout();
};

