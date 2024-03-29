// Store our API endpoint inside queryUrl
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function markerColour(mag) {
    if (mag > 5) {
        return "red";
    } else if (mag > 4) {
        return "#ff6600";
    } else if (mag > 3) {
        return "#ff9933";
    } else if (mag > 2) {
        return "#ffcc00";
    } else if (mag > 1) {
        return "#ffff66";
    } else {
        return "#ccff66";
    }
}

function markerRadius(mag) {
    if (mag == 0) {
        return 0.5;
    } else {
        return mag * 5;
    }
}

// Perform a GET request to the query URL
d3.json(url).then(response => {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(response.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p> Magnitude: " + feature.properties.mag);
}
  
// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer:function(feature, latlng) {
        return L.circleMarker(latlng);
      },
      style:function(feature) {
        return {
          fillOpacity: 1,
          fillColor: markerColour(feature.properties.mag),
          radius:markerRadius(feature.properties.mag),
          color: "black",
          weight: 1
        };
      },
    onEachFeature: onEachFeature
});

// Sending our earthquakes layer to the createMap function
createMap(earthquakes);
}

function getColor(d) {
    return  d > 5 ? "red" :
            d > 4 ? "#ff6600" :
            d > 3 ? "#ff9933" :
            d > 2 ? "#ffcc00" :
            d > 1 ? "#ffff66" :
                    "#ccff66" ;
}

function createMap(earthquakes) {

// Define lightmap layer
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "light-v10",
    accessToken: API_KEY
});

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
    center: [
    39.32, -111.01
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
});

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
}