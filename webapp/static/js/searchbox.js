let map, infoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 6,
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

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation ?
        "Error: The Geolocation service failed." :
        "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
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