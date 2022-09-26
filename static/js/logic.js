// var myMap = L.map("map", {
//     center: [40, -100],
//     zoom: 4
// });

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//   }).addTo(myMap);

function createMap(quakeLayer)
{
    var stadia_dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    var worldImage = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: 'abcd'
    });

    var stadia_outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    subdomains: 'abcd'
    });

    var baseMaps = {
        "Dark Map": stadia_dark,
        "World Image": worldImage,
        "Outdoors": stadia_outdoors
    };

    var overlayMaps = {
        "Earthquakes": quakeLayer
    };

    var myMap = L.map("map", {
        center: [40, -100],
        zoom: 4,
        layers: [stadia_dark, quakeLayer]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

    var legend = L.control({
        position: "bottomright"
    })

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var intervals = [-10, 10, 30, 50, 70, 90];
        var colors = ["limegreen", "greenyellow", "khaki", "lightsalmon", "salmon", "red"]//["red", "salmon", "lightsalmon", "khaki", "greenyellow", "limegreen"]
        for(var i = 0; i < intervals.length; i++)
        {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i>" 
            + intervals[i] 
            + (intervals[i + 1] ? "&ndash;" + intervals[i+1] + "<br>": "+"); 
        }
        return div;
    }
    legend.addTo(myMap)
}

function createMarkers(data)
{
  var earthquakes = data.features
  var markers = [];

  for(var i = 0; i < earthquakes.length; i++)
  {
    var quakeMagnitude = earthquakes[i].properties.mag * 25000
    var quakeColor;

    if(earthquakes[i].geometry.coordinates[2] > 90)
        quakeColor = "red";
    else if(earthquakes[i].geometry.coordinates[2] >= 70)
        quakeColor = "salmon"
    else if(earthquakes[i].geometry.coordinates[2] >= 50)
        quakeColor = "lightsalmon"
    else if(earthquakes[i].geometry.coordinates[2] >= 30)
        quakeColor = "khaki"
    else if(earthquakes[i].geometry.coordinates[2] >= 10)
        quakeColor = "greenyellow"
    else
        quakeColor = "limegreen"

    var quake = L.circle([earthquakes[i].geometry.coordinates[1], earthquakes[i].geometry.coordinates[0]], {
        fillOpacity: 0.4,
        color: quakeColor,
        fillColor: quakeColor,
        radius: quakeMagnitude,
        weight: 1
    }).bindPopup(`<h2>Earthquake Details</h2>Location: ${earthquakes[i].properties.place}<br>Magnitude: ${earthquakes[i].properties.mag}
    <br>Coordinates: [${earthquakes[i].geometry.coordinates[1]}, ${earthquakes[i].geometry.coordinates[0]}]<br>Depth: ${earthquakes[i].geometry.coordinates[2]}`)
    markers.push(quake)
  }
  var quakeLayer = L.layerGroup(markers)
  createMap(quakeLayer);
}

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
  createMarkers
);