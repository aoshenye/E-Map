let markers = []

/**
 * Creates the HTML content for the infoWindow.
 * See example implementation.
 *
 * @see https://chargepoints.dft.gov.uk/api/help in JSON section for options of the data per device
 * @param {*} device JSON object returned from the API
 * @returns string HTML content
 */
function generateMarkerTooltip(device) {
    const loc = device.ChargeDeviceLocation

    return `
    <div>
        <p class="markerName">${device.ChargeDeviceName}</p>
        <p class="markerStatus"> Status: ${device.ChargeDeviceStatus}</p>
        <p class="markerLocation">${loc.Latitude}, ${loc.Longitude}</p>
        <p class="markerAddress">${loc.Address.Street}, ${loc.Address.PostCode}</p>
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
function addMarker(map, device) {
    const infoWindow = new google.maps.InfoWindow({
        content: generateMarkerTooltip(device),
    })
    try {
        const loc = device.ChargeDeviceLocation
        const marker = new google.maps.Marker({
            position: {
                lat: Number.parseFloat(loc.Latitude),
                lng: Number.parseFloat(loc.Longitude),
            },
            map: map,
            icon: "/static/img/mapicon.JPG",
            optimized: false,
        })

        marker.addListener("click", () => {
            infoWindow.open({
                anchor: marker,
                map,
                shouldFocus: false,
            })
        })

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
 * API http://chargepoints.dft.gov.uk/api/ .
 *
 * All chargers in a specified amount of distance around a postion will be added.
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

    // const url = `https://chargepoints.dft.gov.uk/api/retrieve/registry/dist/${dist}/lat/${lat}/long/${lng}/?format=json`
    const url = `https://chargepoints.dft.gov.uk/api/retrieve/registry/?format=json&dist=${dist}&long=${lng}&lat=${lat}`

    const http = new XMLHttpRequest()
    http.open("GET", url)
    http.responseType = "json"

    http.onerror = handleUnexpectedError
    http.onload = (e) => {
        try {
            if (handleHttpError(http)) return

            let response = http.response

            let devices = response.ChargeDevice

            for (let i = 0; i < devices.length; i++) {
                const device = devices[i]
                addMarker(map, device)
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
    http.send()
}

/**
 * This method handles errors occured on the network level.
 * Meaning, there was no response from the called server.
 *
 * @param {*} error error object raised from XmlHttpRequest
 */
function handleUnexpectedError(error) {
    console.log("Unexpected error occured while calling the API")
    // @arnold you should log this error somewhere safe (not visible for the client)
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

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null)
    }
    markers = []
}