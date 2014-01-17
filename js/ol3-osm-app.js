
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

var layers = {
    "Humanitaire": new ol.layer.Tile({
        preload: Infinity,
        source: new ol.source.XYZ({
            url: 'http://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            attributions: [new ol.Attribution({
                html: 'Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            }), ol.source.OSM.DATA_ATTRIBUTION]
        })
    }),
    "MapQuest ouverte": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.MapQuestOSM()
    }),
    "MapBox": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.OSM({
            url: 'https://api.tiles.mapbox.com/v3/examples.map-51f69fea/{z}/{x}/{y}.jpg80',
            attributions: [new ol.Attribution({
                html: '<a href="https://www.mapbox.com/about/maps/" target="_blank">MapBox</a>'
            }), ol.source.OSM.DATA_ATTRIBUTION]
        })
    }),
    "OpenStreetMap": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.OSM()
    }),
    "Carte de transport": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.XYZ({
            url: 'http://{a-c}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png',
            attributions: [new ol.Attribution({
                html: 'Tiles courtesy of <a href="http://www.opencyclemap.org/" target="_blank">Andy Allen</a>'
            }), ol.source.OSM.DATA_ATTRIBUTION]
        })
    }),
    "Carte cyclable": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.XYZ({
            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
            attributions: [new ol.Attribution({
                html: 'Tiles courtesy of <a href="http://www.opencyclemap.org/" target="_blank">Andy Allen</a>'
            }), ol.source.OSM.DATA_ATTRIBUTION]
        })
    }),
    "Bing aerial": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
            imagerySet: 'Aerial'
        })
    })
}
var map = new ol.Map({
    renderer: ol.RendererHint.CANVAS,
    target: 'map',
    view: new ol.View2D({
        center: ol.proj.transform([6.629, 46.517], 'EPSG:4326', 'EPSG:3857'),
        zoom: 10
    })
});
var view = map.getView();
$.each(layers, function(name, layer) {
    map.addLayer(layer);
});

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
    map.beforeRender(ol.animation.pan({
        duration: 500,
        source: view.getCenter()
    }));
    view.setCenter(geolocation.getPosition());
});
$("#geolocation").click(function(event) {
    event.preventDefault();
    geolocation.setTracking(geolocation.getTracking());
});

$("#fullscreen").click(function(event) {
    if (!goog.dom.fullscreen.isSupported()) {
        return;
    }
    event.preventDefault();
    if (goog.dom.fullscreen.isFullScreen()) {
        goog.dom.fullscreen.exitFullScreen();
    } else {
        var target = map.getTarget();
        goog.asserts.assert(goog.isDefAndNotNull(target));
        var element = goog.dom.getElement(target);
        goog.asserts.assert(goog.isDefAndNotNull(element));
        goog.dom.fullscreen.requestFullScreen(element);
    }
});

$("#layers").click(function(event) {
    event.preventDefault();

    var list = "";
    $.each(layers, function(name, layer) {
//        list += '<a href="#">' + (this.getVisible() ? "[V] " : "[ ] ") + this.name + "</a>";
        list += '<a href="#">' + name + "</a>";
    });
    $("#layers-list").html(list);
    $("#layers-list").addClass('selected');
});
$("#layers-list").on("click", "a", function(event) {
    $("#layers-list").removeClass('selected');
    $.each(layers, function(name, layer) {
        layer.setVisible(name == event.currentTarget.innerHTML);
    });
});
