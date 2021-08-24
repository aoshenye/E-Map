var map
var autocomplete
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
  var directionsDisplayPrimary = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  });
  // var directionDisplaysAvoidFerries = new google.maps.DirectionsRenderer;
  // var directionDisplaysAvoidHighways = new google.maps.DirectionsRenderer;
  // var directionDisplaysAvoidTolls = new google.maps.DirectionsRenderer
  // var directionStepByStep = new google.maps.DirectionsRenderer


  //Change Line Colors
  directionsDisplayPrimary.setOptions({
    polylineOptions: {
      strokeColor: 'red'
    }
  })

  // Call function and Pass In Locations. Pass In  A Function For the last Argument As It Will Return Organized Data (Directions, Duration And Other Data)
  //   getDirections("California", "Maine", directionsService, { directionsDisplayPrimary, directionDisplaysAvoidFerries, directionDisplaysAvoidHighways, directionDisplaysAvoidTolls }, (cb) => console.log('here =>', cb))


  directionsDisplayPrimary.setMap(map);
  // directionDisplaysAvoidTolls.setMap(map)
  // directionDisplaysAvoidHighways.setMap(map)
  // directionDisplaysAvoidFerries.setMap(map)


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

  const destination_input = document.getElementById('menu-destination')
  const curr_location = document.getElementById('menu-myLocation')
  const options = {
    componentRestrictions: { country: "uk" },
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
    types: ["establishment"],
  };

  const destination_autocomplete = new google.maps.places.Autocomplete(destination_input, options);
  const currLocation_autocomplete = new google.maps.places.Autocomplete(curr_location, options);
  destination_autocomplete.bindTo("bounds", map);
  currLocation_autocomplete.bindTo("bounds", map);



  destination_autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    infowindowContent.children["place-name"].textContent = place.name;
    infowindowContent.children["place-address"].textContent =
      place.formatted_address;
    infowindow.open(map, marker);
  });

  currLocation_autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    infowindowContent.children["place-name"].textContent = place.name;
    infowindowContent.children["place-address"].textContent =
      place.formatted_address;
    infowindow.open(map, marker);
  });

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
/**
 * 
 * @param {*} origin 
 * @param {*} destination 
 * @param {*} directionsService 
 * @param {*} param3 
 * @param {*} callback 
 * @param {*} avoidables 
 */
const getDirections = async (origin, destination, directionsService, { directionsDisplayPrimary }, callback, avoidables) => {

  console.log(origin)
  console.log(destination)
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    "address": origin
  }, function (results) {
    console.log(results); //LatLng
  });
  const callBackData = {
    primary: null,
    ferries: null,
    highway: null,
    tolls: null
  }

  const center = map.getCenter()
  let pos = {
    lat: center.lat(),
    lng: center.lng(),
  }

  console.log("Adding chargers...")
  if (!pos.lat || !pos.lng)
    return console.log("location must be an object: {lat: number, lng: number}")

  let lat = pos.lat.toString()
  lat = lat.substring(0, Math.min(lat.length, 9))
  let lng = pos.lng.toString()
  lng = lng.substring(0, Math.min(lat.length, 9))

  const connectorFilter =
    selectedConnectorType === "-1" ? "" : "&connector-type-id=" + selectedConnectorType

  // const url =
  //     `https://chargepoints.dft.gov.uk/api/retrieve/registry/?format=json&dist=${dist}&long=${lng}&lat=${lat}` +
  //     connectorFilter

  const url = '/get-chargers?' + `&dist=${dist}&long=${lng}&lat=${lat}` + connectorFilter

  onload = (http, e) => {
    try {
      if (handleHttpError(http)) return

      let response = http.response

      let devices = response.ChargeDevice
      devices_index = parseInt(Math.random() * devices.length)
      console.log(devices_index)
      chargepointLocation = devices[devices_index].ChargeDeviceLocation


      wypts = []
      wypts.push({
        location: new google.maps.LatLng(parseFloat(chargepointLocation.Latitude), parseFloat(chargepointLocation.Longitude)),
        stopover: true
      })
      for (let i = 0; i < avoidables.length; i++) {

        const config = () => avoidables[i] === "primary" ? ({
          origin: origin,
          destination: destination,
          waypoints: wypts,
          travelMode: google.maps.TravelMode.DRIVING,
        }) : ({
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
          [avoidables[i]]: true
        })

        directionsService.route(config(), function (response, status) {
          if (status === 'OK') {


            callBackData.primary = response
            directionsDisplayPrimary.setDirections(response);
            var route = response.routes[0];
            // start marker
            console.log(route)



          } else {

            alert('Directions request failed due to ' + status);

          }

          callback(callBackData)
        });

      }
      return response

      // for (let i = 0; i < devices.length; i++) {
      //     const device = devices[i]
      //     console.log(device)
      // }
    } catch (err) {
      if (err instanceof SyntaxError) {
        console.log("API response object, is no valid JSON object")
      } else if (err instanceof TypeError) {
        console.log("No Chargedevices provided by the API")
      } else {
        console.log(err)
      }
    }
  }

  apicall_get(url, onload, handleUnexpectedError)







}

