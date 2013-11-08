var args = arguments[0] || {};
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
