import requests

api_key = "AIzaSyBRXv-4nyUEs7sEVj1JohJERH0sZ_31PjM"  # "YOUR-OWN-GOOGLE-API-KEY"


def get_geocode(address: str):

    google_get_geo_code_api = 'https://maps.googleapis.com/maps/api/geocode/json?'
    complete_link = f"{google_get_geo_code_api}address={address}&key={api_key}"
    result = requests.get(complete_link)
    result_json = result.json()

    lat, long = None, None

    if result_json["status"] == "OK":
        lat = result_json["results"][0]["geometry"]["location"]["lat"]
        long = result_json["results"][0]["geometry"]["location"]["lng"]

    return lat, long


def get_routes(origin: str, destination: str):

    # API URL - Get Route
    google_get_route_api = 'https://maps.googleapis.com/maps/api/directions/json?'

    # Parse Address Geo Code.
    lat_start, long_start = get_geocode(origin)
    lat_end, long_end = get_geocode(destination)

    # For passing to google api.
    origin = f"{lat_start},{long_start}"
    destination = f"{lat_end},{long_end}"

    # API Call
    complete_link = f"{google_get_route_api}origin={origin}&destination={destination}&key={api_key}"
    result = requests.get(complete_link)
    result_json = result.json()

    # Parse Data from Google API.
    distance = ""
    duration = ""
    steps = []

    if result_json["status"] == "OK":
        route = result_json["routes"][0]["legs"][0]
        origin = route["start_address"]
        destination = route["end_address"]
        distance = route["distance"]["text"]
        duration = route["duration"]["text"]
        steps = route["steps"]
        steps = [[s["distance"]["text"], s["duration"]["text"], s["html_instructions"]] for s in steps]

    return {"status": result_json["status"],
            "origin": origin,
            "destination": destination,
            "distance": distance,
            "duration": duration,
            "steps": steps}


if __name__ == "__main__":
    print(get_routes("Kampar, Perak", "Simpang, Perak"))
