var mapify = require('geojson-mapify');

L.Icon.Default.imagePath = "/images/leaflet";

jQuery.get("community.geojson", function (data) {

  mapify({
    geoJson: JSON.parse(data),
    geoJsonOptions: {
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.githubUsername);
      },
    },
    map: "map",
    mapOptions: {
      zoom: 2, center: new L.latLng([0,0])
    },
  });
});