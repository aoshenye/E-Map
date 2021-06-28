var map
var autocomplete
var infowindow
var infowindowContent
var mapPlaceMarker
var service

// distance (radius in miles) to show chargers around a location
const dist = 1

function initMap() {
    const london = {
        lat: 51.472488477930824,
        lng: -0.24594910113586943,
    }

    map = new google.maps.Map(document.getElementById("map"), {
        center: london, // was initialLocation,
        zoom: 13, // was 13
    })

    // adds async marker
    addCharger(map, london, dist)

    infoWindow = new google.maps.InfoWindow()
    const locationButton = document.createElement("button")
    locationButton.textContent = "Pan to Current Location"
    locationButton.classList.add("custom-map-control-button")
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton)
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    infoWindow.setPosition(pos)
                    infoWindow.setContent("Location found.")
                    infoWindow.open(map)
                    map.setCenter(pos)

                    // adds async marker
                    // addCharger(map, pos, dist)
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter())
                }
            )
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter())
        }
    })

    const newLocationButton = document.createElement("button")
    newLocationButton.textContent = "Use this as new location"
    newLocationButton.classList.add("custom-map-control-button")
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(newLocationButton)
    newLocationButton.addEventListener("click", () => {
        const center = map.getCenter()
        let pos = {
            lat: center.lat(),
            lng: center.lng(),
        }

        deleteMarkers()
        addCharger(map, pos, dist)
    })
}

function autocompleteCallback() {
    infowindow.close()
    const place = autocomplete.getPlace()

    if (!place.geometry) {
        return
    }

    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport)
    } else {
        map.setCenter(place.geometry.location)
        map.setZoom(17)
    }

    // Position of marker using place ID and location
    mapPlaceMarker.setPlace({
        placeId: place.place_id,
        location: place.geometry.location,
    })
    mapPlaceMarker.setVisible(true)
    infowindowContent.children.namedItem("place-name").textContent = place.name

    infowindowContent.children.namedItem("place-address").textContent = place.formatted_address
    infowindow.open(map, mapPlaceMarker)
}
