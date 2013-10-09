exports.definition = {

	config : {

		"adapter" : {
			"type" : "acs",
			"collection_name" : "users"
		}
	},

	extendModel : function(Model) {
		_.extend(Model.prototype, {

			// extended functions go here
			login : function(_login, _password, _callback) {
				var TAP = Ti.App.Properties;
				this.config.Cloud.Users.login({
					login : _login,
					password : _password
				}, function(e) {
					if (e.success) {
						var user = e.users[0];
						TAP.setString("sessionId", e.meta.session_id);
						TAP.setString("user", JSON.stringify(user));
						_callback && _callback({
							success : true,
							model : new model(user)
						});
					} else {
						Ti.API.error(e);
						_callback && _callback({
							success : false,
							model : null,
							error : e
						});
					}
				});
			},
			createAccount : function(_userInfo, _callback) {
				var cloud = this.config.Cloud;
				var TAP = Ti.App.Properties;

				// bad data so return to caller
				if (!_userInfo) {
					_callback && _callback({
						success : false,
						model : null
					});
				} else {
					cloud.Users.create(_userInfo, function(e) {
						if (e.success) {
							var user = e.users[0];
							TAP.setString("sessionId", e.meta.session_id);
							TAP.setString("user", JSON.stringify(user));

							// set this for ACS to track session connected
							cloud.sessionId = e.meta.session_id;

							// callback with newly created user
							_callback && _callback({
								success : true,
								model : new model(user)
							});
						} else {
							Ti.API.error(e);
							_callback && _callback({
								success : false,
								model : null,
								error : e
							});
						}
					});
				}
			},
			logout : function(_callback) {
				var cloud = this.config.Cloud;
				var TAP = Ti.App.Properties;

				cloud.Users.logout(_userInfo, function(e) {
					if (e.success) {
						var user = e.users[0];
						TAP.removeProperty("sessionId");
						TAP.removeProperty("user");

						// callback clearing out the user model
						_callback && _callback({
							success : true,
							model : null
						});
					} else {
						Ti.API.error(e);
						_callback && _callback({
							success : false,
							model : null,
							error : e
						});
					}
				});
			},
			authenticated : function() {
				var cloud = this.config.Cloud;
				var TAP = Ti.App.Properties;

				if (TAP.hasProperty("sessionId")) {
					Ti.API.info("SESSION ID " + TAP.getString("sessionId"));
					cloud.sessionId = TAP.getString("sessionId");
					return true;
				}
				return false;
			},
			showMe : function(_callback) {
				var cloud = this.config.Cloud;
				var TAP = Ti.App.Properties;
				cloud.Users.showMe(function(e) {
					if (e.success) {
						var user = e.users[0];
						TAP.setString("sessionId", e.meta.session_id);
						TAP.setString("user", JSON.stringify(user));
						_callback && _callback({
							success : true,
							model : new model(user)
						});
					} else {
						Ti.API.error(e);
						_callback && _callback({
							success : false,
							model : null,
							error : e
						});
					}
				});
			},
			updateFacebookLoginStatus : function(_accessToken, _opts) {
				var cloud = this.config.Cloud;
				var TAP = Ti.App.Properties;

				// if not logged into facebook, then exit function
				if (Alloy.Globals.FB.loggedIn == false) {
					_opts.error && _opts.error({
						success : false,
						model : null,
						error : "Not Logged into Facebook"
					});
					alert('Please Log Into Facebook first');
					return;
				}

				// we have facebook  access token so we are good
				cloud.SocialIntegrations.externalAccountLogin({
					type : "facebook",
					token : _accessToken
				}, function(e) {
					if (e.success) {
						var user = e.users[0];
						TAP.setString("sessionId", e.meta.session_id);
						TAP.setString("user", JSON.stringify(user));

						// save how we logged in
						TAP.setString("loginType", "FACEBOOK");

						_opts.success && _opts.success({
							success : true,
							model : new model(user),
							error : null
						});
					} else {
						Ti.API.error(e);
						_opts.error && _opts.error({
							success : false,
							model : null,
							error : e
						});
					}
				});
			}
		});
		// end extend

		return Model;
	},

	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {

			// extended functions go here

		});
		// end extend

		return Collection;
	},
};
