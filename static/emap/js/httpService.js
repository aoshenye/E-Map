async function apicall_get(url, onload_, onerror_) {
  const http = new XMLHttpRequest()
  http.open("GET", url)
  http.responseType = "json"

  http.onerror = onerror_
  http.onload = (e) => onload_(http, e)

  http.send()
}