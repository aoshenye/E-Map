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
  // addCharger(map, london, dist)
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplayPrimary = new google.maps.DirectionsRenderer;
  var directionDisplaysAvoidFerries = new google.maps.DirectionsRenderer;
  var directionDisplaysAvoidHighways = new google.maps.DirectionsRenderer;
  var directionDisplaysAvoidTolls = new google.maps.DirectionsRenderer

  //Change Line Colors
  directionsDisplayPrimary.setOptions({
    polylineOptions: {
      strokeColor: 'red'
    }
  })

// Call function and Pass In Locations. Pass In  A Function For the last Argument As It Will Return Organized Data (Directions, Duration And Other Data)
  getDirections("California", "Maine", directionsService, { directionsDisplayPrimary, directionDisplaysAvoidFerries, directionDisplaysAvoidHighways, directionDisplaysAvoidTolls }, (cb) => console.log('here =>', cb))

  ["avoidFerries", "avoidHighways", "avoidTolls"]


  directionsDisplayPrimary.setMap(map);
  directionDisplaysAvoidTolls.setMap(map)
  directionDisplaysAvoidHighways.setMap(map)
  directionDisplaysAvoidFerries.setMap(map)

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

const getDirections = async (origin, destination, directionsService, { directionsDisplayPrimary, directionDisplaysAvoidFerries, directionDisplaysAvoidHighways, directionDisplaysAvoidTolls }, callback) => {

  const callBackData = {
    primary: null,
    ferries: null,
    highway: null,
    tolls: null
  }
  const avoidables = ["avoidFerries", "avoidHighways", "avoidTolls"]
  for (let i = 0; i < avoidables.length; i++) {
    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING',
      [avoidables[i]]: true
    }, function (response, status) {
      if (status === 'OK') {

        console.log(avoidables[i])
        if (avoidables[i] === "avoidFerries") {
          callBackData.ferries = response
          directionDisplaysAvoidFerries.setDirections(response)
        } else if (avoidables[i] === "avoidHighways") {
          callBackData.highway = response
          directionDisplaysAvoidHighways.setDirections(response)
        } else if (avoidables[i] === "avoidTolls") {
          callBackData.tolls = response
          directionDisplaysAvoidTolls.setDirections(response)
        }
        callBackData.primary = response
        directionsDisplayPrimary.setDirections(response);



        console.log(response.routes[0].legs[0])

      } else {

        alert('Directions request failed due to ' + status);

      }

      callback(callBackData)
    });
  }

}

