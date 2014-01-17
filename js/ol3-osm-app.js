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
var found = null;
var geojsonformat = new ol.format.GeoJSON();
var selectedStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 100, 0, 0.2)',
        width: 2
    }),
    fill: new ol.style.Fill({
        color: 'rgba(255, 100, 0, 0.2)'
    }),
    image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Stroke({color: 'rgba(255, 100, 0, 0.2)'}),
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 100, 0, 0.2)',
            width: 2
        })
    })
});
this.map.on('postcompose', function(evt) {
    if (found) {
        var render = evt.getRender();
        render.drawFeature(found.feature, selectedStyle);
    }
});
$("#search").autocomplete({
    source: function(request, responce) {
        $.ajax({
            url: 'http://nominatim.openstreetmap.org/search',
            dataType: "jsonp",
            jsonp: 'json_callback',
            data: {
                format: 'jsonv2',
                q: request.term,
                limit: 20,
                polygon_geojson: 1,
            },
            success: function(data) {
                responce($.map(data, function(item) {
                    var geom = geojsonformat.readGeometry(item.geojson);
                    geom.transform(ol.proj.getTransform('EPSG:4326', 'EPSG:3857'));
                    item.feature = new ol.Feature(geom);
                    return {
                        label: "[" + geom.getType() + "] " + item.display_name,
                        value: item.display_name,
                        item: item
                    }
                }));
            }
        })
    },
    select: function(event, result) {
        found = result.item.item;

        map.requestRenderFrame();

        if (found.feature.getGeometry().getType() == 'Point') {
            map.beforeRender(ol.animation.pan({
                duration: 500,
                source: view.getCenter()
            }));
            view.setCenter(found.feature.getGeometry().getCoordinates());
        }
        else {
            map.beforeRender(ol.animation.zoom({
                duration: 500,
                resolution: view.getResolution()
            }));
            map.beforeRender(ol.animation.pan({
                duration: 500,
                source: view.getCenter()
            }));
            view.fitExtent(found.feature.getGeometry().getExtent(), map.getSize());
        }
    }
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