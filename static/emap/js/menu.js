
const findRoute = () => {
    const london = {
        lat: 51.472488477930824,
        lng: -0.24594910113586943,
    }
    let map = new google.maps.Map(document.getElementById("map"), {
        center: london, // was initialLocation,
        zoom: 13, // was 13
    })

    const menu = document.getElementById("menu")
    const mapEl = document.getElementById("map")

    const ferriesInput = document.getElementById("cb-ferries").checked
    const highwayInput = document.getElementById("cb-highway").checked
    const tollsInput = document.getElementById("cb-toll").checked

    let avoidables = ["primary"]
    let customizedOptions = ['ferries', 'highway', 'tolls']
    customizedOptions.forEach((option => {
        switch (option) {
            case 'ferries':
                ferriesInput ? avoidables.push("avoidFerries") : null
                return
            case 'highway':
                highwayInput ? avoidables.push("avoidHighways") : null
                return
            case 'tolls':
                tollsInput ? avoidables.push("avoidTolls") : null
        }
    }))
    //     console.log(avoidables)
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplayPrimary = new google.maps.DirectionsRenderer;
    var directionDisplaysAvoidFerries = new google.maps.DirectionsRenderer;
    var directionDisplaysAvoidHighways = new google.maps.DirectionsRenderer;
    var directionDisplaysAvoidTolls = new google.maps.DirectionsRenderer


    directionsDisplayPrimary.setMap(map);
    directionDisplaysAvoidTolls.setMap(map)
    directionDisplaysAvoidHighways.setMap(map)
    directionDisplaysAvoidFerries.setMap(map)
    directionsDisplayPrimary.setPanel(document.getElementById('directionsPanel'));

    if (mapEl.style.display === "none") {

        menu.style.display = "none";
        mapEl.style.display = "block"
    }

    const options = {}
    const origin = document.getElementById("menu-myLocation").value
    const destination = document.getElementById("menu-destination").value

    getDirections(origin, destination, directionsService, { directionsDisplayPrimary }, () => { }, avoidables)
}

const hideMenu = () => {
    const menu = document.getElementById("menu")
    const map = document.getElementById("map")
    let isToggledState = menu.style.display
    if (!isToggledState || isToggledState === 'none') {
        menu.style.display = "block"
        map.style.display = "none"
    } else {
        menu.style.display = "none"
        map.style.display = "block"
    }
    console.log(isToggledState)
}