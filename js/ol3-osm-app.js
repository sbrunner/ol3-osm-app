var style = [new ol.style.Style({
    image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Stroke({color: 'rgba(0, 0, 0, 0.2)'}),
        stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 0.7)', width: 1})
    })
})];
var styleFunction = function(feature, resolution) {
    return style;
};

var map = new ol.Map({
    renderer: ol.RendererHint.CANVAS,
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.MapQuestOSM()
        })
    ],
    view: new ol.View2D({
        center: ol.proj.transform([6.629, 46.517], 'EPSG:4326', 'EPSG:3857'),
        zoom: 10
    }),
    controls: ol.control.defaults().extend([
    ])
});
var view = map.getView();

$.urlParam = function(key) {
    var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search);
    return result && unescape(result[1]) || "";
};

var first = true;
$("#search").autocomplete({
    // TODO
});

var geolocation = new ol.Geolocation();
geolocation.setProjection(view.getProjection());
geolocation.on('change:position', function(event) {
        geolocation.setTracking(false);

    map.beforeRender(ol.animation.zoom({
        duration: 500,
        resolution: view.getResolution()
    }));
    view.setZoom(14);

    map.beforeRender(ol.animation.pan({
        duration: 500,
        source: view.getCenter()
    }));
    view.setCenter(geolocation.getPosition());

    var features = bases.getAllFeatures();
    var feature = null;
    var squaredDist = +Infinity;
    $.each(features, function() {
        var candidateSquaredDist =
            Math.pow(geolocation.getPosition()[0] - this.getGeometry().getCoordinates()[0], 2) +
            Math.pow(geolocation.getPosition()[1] - this.getGeometry().getCoordinates()[1], 2);
        if (candidateSquaredDist < squaredDist) {
            squaredDist = candidateSquaredDist;
            feature = this;
        }
    });
    if (feature) {
        // TODO
    }
});
geolocation.setTracking(true);
