// Stockholm 
const initialLocation = {
    lat: 59.334591,
    lng: 18.063240
};
var map;
var autocomplete;
var infowindow;
var infowindowContent;
var mapPlaceMarker;
var service;

let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: new google.maps.LatLng(2.8, -187.3),
        mapTypeId: "terrain",
    });
    // Create a <script> tag and set the USGS URL as the source.
    const script = document.createElement("script");
    // This example uses a local copy of the GeoJSON stored at
    // http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp
    script.src =
        "https://developers.google.com/maps/documentation/javascript/examples/json/earthquake_GeoJSONP.js";
    document.getElementsByTagName("head")[0].appendChild(script);
}

// Loop through the results array and place a marker for each
// set of coordinates.
const eqfeed_callback = function(results) {
    for (let i = 0; i < results.features.length; i++) {
        const coords = results.features[i].geometry.coordinates;
        const latLng = new google.maps.LatLng(coords[1], coords[0]);
        new google.maps.Marker({
            position: latLng,
            map: map,
        });
    }
};

// Specify just the place data fields that you need.
autocomplete.setFields(["place_id", "geometry", "name", "formatted_address"]);

map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
infowindow = new google.maps.InfoWindow();
infowindowContent = document.getElementById("infowindow-content");
infowindow.setContent(infowindowContent);

mapPlaceMarker = new google.maps.Marker({
    map: map
});
mapPlaceMarker.addListener("click", () => {
    infowindow.open(map, marker);
});

// Places API service
service = new google.maps.places.PlacesService(map);

autocomplete.addListener("place_changed", autocompleteCallback);
}

/* 
Searches the place which is on the map for clubs
*/
function searchPlace(location) {
    var service = new google.maps.places.PlacesService(map);
    var request = {
        location: location,
        radius: '500',
        type: ['night_club']
    };

    service.nearbySearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkersAndUpdateHTML(results, map);
    }
}

function createMarkersAndUpdateHTML(places, map) {
    const bounds = new google.maps.LatLngBounds();
    for (let i = 0, place;
        (place = places[i]); i++) {
        const image = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
        };
        marker = new google.maps.Marker({
            map,
            icon: image,
            title: place.name,
            position: place.geometry.location,
        });

        // Add callback to the marker here

        function initMap() {

            var latlng = new google.maps.LatLng(28.535516, 77.391026);

            if (navigator.geolocation) {
                try {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var myLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        setPos(myLocation);
                    });
                } catch (err) {
                    var myLocation = {
                        lat: 25.2048,
                        lng: 55.2708
                    };
                    setPos(myLocation);
                }
            } else {
                var myLocation = {
                    lat: 25.2048,
                    lng: 55.2708
                };
                setPos(myLocation);
            }
        }

        function setPos(myLocation) {
            map = new google.maps.Map(document.getElementById('map'), {
                center: myLocation,
                zoom: 10
            });
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: myLocation,
                radius: 5000,
                types: ['night_club']
            }, processResults);
        }

        function processResults(results, status, pagination) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
            } else {
                createMarkers(results);
            }
        }

        function createMarkers(places) {
            var bounds = new google.maps.LatLngBounds();
            var placesList = document.getElementById('places');
            for (var i = 0, place; place = places[i]; i++) {

                var marker = new google.maps.Marker({
                    map: map,
                    icon: image,
                    title: place.name,
                    animation: google.maps.Animation.DROP,
                    position: place.geometry.location
                });

                bounds.extend(place.geometry.location);
            }
            map.fitBounds(bounds);
        }

        // To add the marker to the map, call setMap();
        marker.setMap(map);

        bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
}

function autocompleteCallback() {
    infowindow.close();
    const place = autocomplete.getPlace();

    if (!place.geometry) {
        return;
    }

    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
    }
    // Position of marker using place ID and location
    mapPlaceMarker.setPlace({
        placeId: place.place_id,
        location: place.geometry.location,
    });
    mapPlaceMarker.setVisible(true);
    infowindowContent.children.namedItem("place-name").textContent =
        place.name;

    infowindowContent.children.namedItem("place-address").textContent =
        place.formatted_address;
    infowindow.open(map, mapPlaceMarker);

    // Call places API to search close area for other bars & clubs
    searchPlace(place.geometry.location);
}

function createPhotoMarker(place) {
    var photos = place.photos;
    if (!photos) {
        return;
    }

    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name,
        icon: photos[0].getUrl({
            maxWidth: 35,
            maxHeight: 35
        })
    });
}

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        /* Adding and removing "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}

/* Initializing promise of response */
$(document).ready(function() {
    $("button").click(function() {
        $("#Hilma").html("<h1>Salsa for Beginners 1800 - 1930</h1>");
    });
});

$(document).ready(function() {
    $("button").click(function() {
        $("#SpyBar").html("<h1>Dj Ivan classics 21-3</h1>");
    });
});

$(document).ready(function() {
    $("button").click(function() {
        $("#Sodra").html("<h1>Hip Hop & R&B with dj Messi from 2200 - 500</h1>");
    });
});

$(document).ready(function() {
    $("button").click(function() {
        $("#Slak").html("<h1>Jazz night with special guest perfomances 1900 - 2300</h1>");
    });
});

$(document).ready(function() {
    $("button").click(function() {
        $("#Fash").html("<h1>Flash mob part with Kaz & Jeff 2100 - 0000</h1>");
    });
});

$(document).ready(function() {
    $("button").click(function() {
        $("#Trad").html("<h1>Field Play events 1700 - 2100</h1>");
    });
});

$(document).ready(function() {
    $("button").click(function() {
        $("#Hobo").html("<h1> Hotel Selections presents... 2100 - 300</h1>");
    });
});

$(document).ready(function() {
    $("button").click(function() {
        $("#Himlen").html("<h1>After Work 1800 - 0000</h1>");
    });
});