var map;
var autocomplete;
var infowindow;
var infowindowContent;
var mapPlaceMarker;
var service;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 13,
    });
    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
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
}