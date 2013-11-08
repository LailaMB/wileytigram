function reverseGeocoder(_lat, _lng, _callback) {
    var title;

    Ti.Geolocation.purpose = "Wiley Alloy App Demo";

    // callback method converting lat lng into a location/address
    Ti.Geolocation.reverseGeocoder(_lat, _lng, function(_data) {
        if (_data.success) {
            var place = _data.places[0];
            if (place.city === "") {
                title = place.address;
            } else {
                title = place.street + " " + place.city;
            }
        } else {
            title = "No Address Found: " + _lat + ", " + _lng;
        }
        _callback(title);
    });
}
exports.getCurrentLocation = function(_callback) {
    if (!Ti.Geolocation.getLocationServicesEnabled()) {
        alert('Location Services are not enabled');
        _callback(null, 'Location Services are not enabled');
        return;
    }

    Ti.Geolocation.purpose = "Get Current Location";
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
    Ti.Geolocation.distanceFilter = 10;
    Ti.Geolocation.getCurrentPosition(function(_location) {
        if (!_location.error && _location && _location.coords) {

            var lat, lng;
            Ti.API.info(JSON.stringify(_location));

            lat = _location.coords.latitude;
            lng = _location.coords.longitude;

            reverseGeocoder(lat, lng, function(_title) {
                _callback({
                    coords : _location.coords,
                    title : _title
                }, null);
            });
        } else {
            alert('Location Services an Error');
            _callback(null, _location.error);
        }
    });
};
