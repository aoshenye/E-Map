let markers = []

// -1 means all connectors allowed
let selectedConnectorType = "-1"

/**
 * Creates the HTML content for the infoWindow.
 * See example implementation.
 *
 * @see https://chargepoints.dft.gov.uk/api/help in JSON section for options of the data per device
 * @param {*} device JSON object returned from the API
 * @returns string HTML content
 */
function generateMarkerTooltip(device, origin) {
    const loc = device.ChargeDeviceLocation
    console.log(loc.Latitude)
    console.log(loc.Longitude)
    console.log(origin)
    return `
    <div>
        <p class="markerName">${device.ChargeDeviceName}</p>
        <p class="markerStatus"> Status: ${device.ChargeDeviceStatus}</p>
        <p class="markerLocation">${loc.Latitude}, ${loc.Longitude}</p>
        <p class="markerAddress">${loc.Address.Street}, ${loc.Address.PostCode}</p>
        <button class="btn btn-success" onclick=" window.open('https://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&origin=${origin}&destination=${loc.Latitude},${loc.Longitude}','_blank')">Directions</button>
    </div>
    `
}

/**
 * This methods adds a single marker on a given map.
 *
 * @see https://chargepoints.dft.gov.uk/api/help in JSON section for options of the data per device
 * @param {*} map map to place the marker on
 * @param {*} device charger device containing location and data (look above for structure)
 */
function addMarker(map, device, origin) {
    const infoWindow = new google.maps.InfoWindow({
        content: generateMarkerTooltip(device, origin),
    })

    try {
        const loc = device.ChargeDeviceLocation
        const marker = new google.maps.Marker({
            position: {
                lat: Number.parseFloat(loc.Latitude),
                lng: Number.parseFloat(loc.Longitude),
            },
            map: map,
            icon: "static/smallicon.JPG",
            // optimized: false,
        })

        marker.addListener("click", () => {
            infoWindow.open({
                anchor: marker,
                map,
                shouldFocus: false,
            });
        });

        markers.push(marker)
    } catch (err) {
        if (err instanceof TypeError) {
            console.log("device must be an object from https://chargepoints.dft.gov.uk API")
        } else {
            // InvalidValueError
            console.log("Please make sure that map is an google-map-object")
        }
    }
}

/**
 * Adds all google maps markers for all charger positions retrieved from
 * API https://chargepoints.dft.gov.uk/api/ .
 *
 * All chargers in a specified amount of distance around a postion will be added.
 *
 * All chargers that match the ConnectorTypeID in the global variable selectedConnectorType.
 *
 * @param {*} map The map object where the markers should be added
 * @param {*} location Location from which chargers around will be added {lat: number, lng: number}
 * @param {*} dist The radius around location to show chargers.
 */
async function addCharger(map, location, dist) {
    if (!location.lat || !location.lng)
        return console.log("location must be an object: {lat: number, lng: number}")

    let lat = location.lat.toString()
    lat = lat.substring(0, Math.min(lat.length, 9))
    let lng = location.lng.toString()
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
            
            search_value = document.getElementById("pac-input").value

            if (!search_value) {
                const center = map.getCenter()
                search_value = `${center.lat()},${center.lng()}`
            }

            if (currentLocation) {
                search_value = `${currentLocation.lat},${currentLocation.lng}`
            }

            console.log(search_value)

            for (let i = 0; i < devices.length; i++) {
                addMarker(map, devices[i], search_value)
            }
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


/**
 * Delets all markers from the map
 */
function deleteMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null)
    }
    markers = []
}

/**
 * Adds all Connector Types to the html-select-element.
 */
function addConnectorTypes() {
    let typeSelect = $("#chargertype_select")

    //const url = "https://chargepoints.dft.gov.uk/api/retrieve/type?format=json"
    const url = "/get-connector-types?"
    let cb_types = (http, e) => {
        try {
            if (handleHttpError(http)) return

            let response = http.response
            let types = response.ConnectorType

            Object.keys(types).forEach((i) => {
                let type = types[i]
                let displayName = type.ConnectorType.split("(")[0]
                typeSelect.append(
                    "<option value='" + type.ConnectorTypeID + "'>" + displayName + "</option>"
                )
            })
        } catch (err) {
            if (err instanceof SyntaxError) {
                console.log("API response object, is no valid JSON object")
            } else {
                console.log(err)
            }
        }
    }
    apicall_get(url, cb_types, handleUnexpectedError)
}

/**
 *  On selecting another Connector type, the selcted connector will
 * be stored in selectedConnectorType and refreshes the map with the new markers
 *
 * @param {*} elem HTML-Element select for selectin connector types
 */
function typeSelected(elem) {
    selectedConnectorType = elem.value

    let lat = map.getCenter().lat()
    let lng = map.getCenter().lng()

    deleteMarkers()
    addCharger(map, {
        lat: lat,
        lng: lng
    }, dist)
}

/**
 * Handling all Client errors.
 * There was a valid response from the server.
 * Maybe display a toast notification or something you prefer.
 *
 * Feel free to add more HttpError by adding another case with the http-status code
 * @see https://www.restapitutorial.com/httpstatuscodes.html for httpstatuscodes
 * @param {*} error
 */
function handleHttpError(req) {
    switch (req.status) {
        case 400:
            console.log("Handle Bad Request")
            // console.log(req.responseText)
            return true
        case 404:
            console.log("Handle Not Found")
            // console.log(req.responseText)
            return true
        default:
            return false
    }
}

/**
 * This method handles errors occured on the network level.
 * Meaning, there was no response from the called server.
 *
 * @param {*} error error object raised from XmlHttpRequest
 */
function handleUnexpectedError(error) {
    console.log(error)
    console.log("Unexpected error occured while calling the API")
    // @arnold you should log this error somewhere safe (not visible for the client)
}