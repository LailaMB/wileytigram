var Cloud = require('ti.cloud');
var AndroidPush = OS_ANDROID ? require('ti.cloudpush') : null;

exports.initialize = function(_user, _pushRcvCallback, _callback) {

    if (Ti.Platform.model === 'Simulator') {
        alert("Push ONLY works on Devices!");
        return;
    }

    // only register push if we have a user logged in
    if (_user.get("id")) {

        if (OS_ANDROID) {
            // ANDROID SPECIFIC CODE GOES HERE
            // reset any settings
            AndroidPush.clearStatus();

            // set some properties
            AndroidPush.debug = true;
            AndroidPush.showTrayNotificationsWhenFocused = true;

            AndroidPush.retrieveDeviceToken({
                success : function(_data) {
                    Ti.API.debug("recieved device token", _data.deviceToken);

                    // what to call when push is received
                    AndroidPush.addEventListener('callback', _pushRcvCallback);

                    // set some more properties
                    AndroidPush.enabled = true;
                    AndroidPush.focusAppOnPush = false;

                    pushRegisterSuccess(_data, _callback);
                },
                error : function(_data) {
                    AndroidPush.enabled = false;
                    AndroidPush.focusAppOnPush = false;
                    AndroidPush.removeEventListener('callback', _pushRcvCallback);

                    pushRegisterError(_data, _callback);
                }
            });

        } else {
            Ti.Network.registerForPushNotifications({
                types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
                success : function(_data) {
                    pushRegisterSuccess(_data, _callback);
                },
                error : function(_data) {
                    pushRegisterError(_data, _callback);
                },
                callback : function(_data) {
                    // what to call when push is recieved
                    _pushRcvCallback(_data.data);
                }
            });
        }
    } else {
        _callback && _callback({
            success : false,
            msg : 'Must have User for Push Notifications',
        });
    }
};

exports.subscribe = function(_channel, _token, _callback) {
    Cloud.PushNotifications.subscribe({
        channel : _channel,
        device_token : _token,
        type : OS_IOS ? 'ios' : 'gcm'
    }, function(_event) {

        var msgStr = "Subscribed to " + _channel + " Channel";
        Ti.API.debug(msgStr + ': ' + _event.success);

        if (_event.success) {
            _callback({
                success : true,
                error : null,
                msg : msgStr
            });

        } else {
            _callback({
                success : false,
                error : _event.data,
                msg : "Error Subscribing to All Channels"
            });
        }
    });
};

exports.sendPush = function(_params, _callback) { debugger;

    if (Alloy.Globals.pushToken === null) {
        _callback({
            success : false,
            error : "Device Not Registered For Notifications!"
        });
        return;
    }

    // set the default parameters, send to
    // user subscribed to friends channel
    var data = {
        channel : 'friends',
        payload : _params.payload,
    };

    // add optional parameter to determine if should be sent to all
    // friends or to a specific friend
    _params.friends && (data.friends = _params.friends);
    _params.to_ids && (data.to_ids = _params.to_ids);

    Cloud.PushNotifications.notify(data, function(e) {
        if (e.success) {
            // it worked
            _callback({
                success : true
            });
        } else {
            var eStr = (e.error && e.message) || JSON.stringify(e);
            Ti.API.error(eStr);
            _callback({
                success : false,
                error : eStr
            });
        }
    });
};

exports.pushUnsubscribe = function(_data, _callback) {

    Cloud.PushNotifications.unsubscribe(_data, function(e) {
        if (e.success) {
            Ti.API.debug('Unsubscribed from: ' + _data.channel);
            _callback({
                success : true,
                error : null
            });
        } else {
            Ti.API.error('Error unsubscribing: ' + _data.channel);
            Ti.API.error(JSON.stringify(e, null, 2));
            _callback({
                success : false,
                error : e
            });
        }
    });
};

exports.logout = function(_callback) {
    exports.pushUnsubscribe({
        channel : OS_IOS ? 'IOS' : 'ANDROID',
        device_token : Alloy.Globals.pushToken
    }, function(_response) {

        if (_response.success === false) {
            alert("error logging out, notification platform channel");
        }
        exports.pushUnsubscribe({
            channel : 'friends',
            device_token : Alloy.Globals.pushToken
        }, function() {

            if (_response.success === false) {
                alert("error logging out, notification Friends channel");
            }
            _callback();
        });
    });
};

exports.getChannels = function(_user, _callback) {

    var xhr = Ti.Network.createHTTPClient();

    // create the url with params

    // get the environment specific Key
    var acsKeyName = "acs-api-key-development" + (Alloy.CFG.isProduction ? "production" : "development");

    // construct the URL
    var url = "https://api.cloud.appcelerator.com/v1/push_notification/query.json?key=";
    url += Ti.App.Properties.getString(acsKeyName);
    url += "&user_id=" + _user.id;

    xhr.open("GET", url);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onerror = function(e) {
        alert(String(e));
        Ti.API.error(" " + String(e));
    };
    xhr.onload = function() {
        try {
            Ti.API.debug(" " + xhr.responseText);
            var data = JSON.parse(xhr.responseText);
            var subscriptions = data.response.subscriptions[0];
            Ti.API.debug(JSON.stringify(subscriptions));

            _callback && _callback({
                success : true,
                data : subscriptions,
            });

        } catch(E) {
            Ti.API.error(" " + String(E));

            _callback && _callback({
                success : false,
                data : null,
                error : E
            });
        }
    };

    xhr.send();

};

function pushRegisterError(_data, _callback) {
    _callback && _callback({
        success : false,
        error : _data
    });
}

function pushRegisterSuccess(_data, _callback) {

    var token = _data.deviceToken;

    exports.subscribe("friends", token, function(_resp1) {

        // if successful subscribe to the platform specific channel
        if (_resp1.success) {
            var channel = OS_IOS ? 'IOS' : 'ANDROID';
            exports.subscribe(channel, token, function(_resp2) {
                if (_resp2.success) {
                    _callback({
                        success : true,
                        msg : "Subscribe to channel: " + channel,
                        data : _data,
                    });
                } else {
                    _callback({
                        success : false,
                        error : _resp2.data,
                        msg : "Error Subscribing to channel:" + channel
                    });
                }
            });
        } else {
            // if not then return error and false success flag
            _callback({
                success : false,
                error : _resp1s.data,
                msg : "Error Subscribing to All Channels"
            });
        }
    });
}
