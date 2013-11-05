var args = arguments[0] || {};

// the android module is available in marketplace
// Google Maps Android API v2 :
//    https://marketplace.appcelerator.com/apps/5005?1002839494
// Additional Documentation available here:
//    http://docs.appcelerator.com/titanium/latest/#!/guide/Google_Maps_v2_for_Android

var MapModule = Alloy.Globals.Map;

// get the photo object from the parameters
var coords = args.photo.get("custom_fields").coordinates[0];
var locationString = args.photo.get("custom_fields").location_string;

// create annotation
var annotation = MapModule.createAnnotation({
	latitude : Number(coords[1]),
	longitude : Number(coords[0]),
	title : args.photo.get("title"),
	subtitle : locationString,
	myid : args.photo.id
	//leftView : imageView,
	// animate : true
});
// set the header
$.thumb.image = args.photo.get("urls")["preview"];
$.title.text = args.photo.get("title");
$.location.text = locationString;

// add them to map
$.mapview.setAnnotations([annotation]);

// set the region around the photo
$.mapview.setRegion({
	latitude : annotation.latitude,
	longitude : annotation.longitude,
	latitudeDelta : 0.040,
	longitudeDelta : 0.040
});
