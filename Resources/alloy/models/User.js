exports.definition = {
    config: {
        adapter: {
            type: "acs",
            collection_name: "users"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            login: function(_login, _password, _callback) {
                this.config.Cloud.Users.login({
                    login: _login,
                    password: _password
                }, function(e) {
                    if (e.success) {
                        var user = e.users[0];
                        Ti.App.Properties.setString("sessionId", e.meta.session_id);
                        Ti.App.Properties.setString("user", JSON.stringify(user));
                        _callback && _callback({
                            success: true,
                            model: new model(user)
                        });
                    } else {
                        Ti.API.error(e);
                        _callback && _callback({
                            success: false,
                            model: null,
                            error: e
                        });
                    }
                });
            },
            authenticated: function() {
                if (Ti.App.Properties.hasProperty("sessionId")) {
                    this.config.Cloud.sessionId = Ti.App.Properties.getString("sessionId");
                    return true;
                }
                return false;
            }
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    }
};

var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

model = Alloy.M("user", exports.definition, []);

collection = Alloy.C("user", exports.definition, model);

exports.Model = model;

exports.Collection = collection;