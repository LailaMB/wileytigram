exports.definition = {
    config: {
        adapter: {
            type: "acs",
            collection_name: "reviews"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {});
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    }
};

var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

model = Alloy.M("comment", exports.definition, []);

collection = Alloy.C("comment", exports.definition, model);

exports.Model = model;

exports.Collection = collection;