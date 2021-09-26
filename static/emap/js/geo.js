let map, infoWindow
var autocomplete
var currentLocation
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
    center: london,
    zoom: 13,
    mapTypeId: "roadmap",
  });
  infoWindow = new google.maps.InfoWindow();


  //====================SEARCH BOX===========================
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];
    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };
      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  //====================Current Location======================
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
          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);

          currentLocation = pos
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

  //=====================LOAD CHARGEPOINTS======================
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