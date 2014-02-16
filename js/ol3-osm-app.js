
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
    "MapQuest osm": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.MapQuest({layer: 'osm'})
    }),
    "MapQuest ortho": new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.MapQuest({layer: 'sat'})
    }),
    "MapQuest hybride": new ol.layer.Group({
        style: 'AerialWithLabels',
        visible: false,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'sat'})
            }),
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'hyb'})
            })
        ]
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
};
var map = new ol.Map({
    renderer: ol.RendererHint.CANVAS,
    target: 'map',
    view: new ol.View2D({
        center: ol.proj.transform([6.629, 46.517], 'EPSG:4326', 'EPSG:3857'),
        zoom: 10
    }),
    controls: [new ol.control.Attribution()]
});
var view = map.getView();
$.each(layers, function(name, layer) {
    map.addLayer(layer);
});

$.urlParam = function(key) {
    var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search);
    return result && unescape(result[1]) || "";
};

$(".toolbar div a").hover(function(event) {
    $('body').append('<div class="tooltip"><div>' + event.target.getAttribute('data-tooltip') + '</div></div>');
    var tooltip = $('.tooltip');
    var pos = $(event.target).offset();
    tooltip.css('top', pos.top);
    tooltip.css('right', $(document).width() - pos.left + 10);
    tooltip.delay(5000).fadeOut();
}, function(event) {
    $(".tooltip").remove();
});

function zoom(delta) {
    var currentResolution = view.getResolution();
    if (goog.isDef(currentResolution)) {
        map.beforeRender(ol.animation.zoom({
            resolution: currentResolution,
            duration: 250,
            easing: ol.easing.easeOut
        }));
        var newResolution = view.constrainResolution(currentResolution, delta);
        view.setResolution(newResolution);
    }
}
$("#zoom-in").click(function(event) {
    event.preventDefault();
    zoom(1);
});
$("#zoom-out").click(function(event) {
    event.preventDefault();
    zoom(-1);
});

var routingSource = new ol.source.Vector({
    projection: 'EPSG:3857'
});
var routingOverlay = new ol.FeatureOverlay({
    map: map,
    style: function() {
        return [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 100, 255, 0.8],
                width: 6
            })
        })];
    }
});
var destIcon = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    size: [25, 25],
    src: "image/destination50.png"
}));
destIcon.load();
var destinationOverlay = new ol.FeatureOverlay({
    map: map,
    style: function() {
        return [new ol.style.Style({
            image: destIcon
        })];
    }
});
var nextInstructionOverlay1 = new ol.FeatureOverlay({
    map: map,
    style: function() {
        return [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 0, 0, 0.6],
                width: 14
            })
        })];
    }
});
var nextInstructionOverlay2 = new ol.FeatureOverlay({
    map: map,
    style: function() {
        return [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [255, 255, 255, 1],
                width: 12
            })
        })];
    }
});
var instructionsOverlay = new ol.FeatureOverlay({
    map: map,
    style: function() {
        return [new ol.style.Style({
            image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({
                    color: [0, 0, 140, 0.4]
                })
            })
        })];
    }
});
var foundCentroid;
var foundOverlay = new ol.FeatureOverlay({
    map: map,
    style: function() {
        return [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [255, 100, 0, 0.4],
                width: 2
            }),
            fill: new ol.style.Fill({
                color: [255, 100, 0, 0.2]
            }),
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Stroke({color: [255, 100, 0, 0.2]}),
                stroke: new ol.style.Stroke({
                    color: [255, 100, 0, 0.8],
                    width: 1
                })
            })
        })];
    }
});
var first = true;
var geojsonformat = new ol.format.GeoJSON();
var result_template = Handlebars.compile($('#result-template').html());
var search_template = Handlebars.compile($('#search-template').html());
var routing_template = Handlebars.compile($('#routing-template').html());
$("#search").autocomplete({
    source: function(request, responce) {
        var extent = view.calculateExtent(map.getSize());
        extent = ol.extent.transform(extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
        $.ajax({
            url: 'http://nominatim.openstreetmap.org/search',
            dataType: "jsonp",
            jsonp: 'json_callback',
            data: {
                format: 'jsonv2',
                q: request.term,
                limit: 20,
                polygon_geojson: 1,
                viewbox: extent[0] + "," + extent[1] + "," + extent[2] + "," + extent[3],
                //bounded: 1,
                zoom: view.getZoom(),
                addressdetails: 1
            },
            success: function(data) {
                responce($.map(data, function(item) {
                    var geom = geojsonformat.readGeometry(item.geojson);
                    geom.transform(ol.proj.getTransform('EPSG:4326', 'EPSG:3857'));
                    item.feature = new ol.Feature(geom);
                    return {
                        label: search_template(item),
                        value: item.display_name,
                        item: item
                    };
                }));
            }
        });
    },
    select: function(event, result) {
        var feature = result.item.item.feature;
        foundOverlay.setFeatures(new ol.Collection([feature]));
        foundCentroid = [parseFloat(result.item.item.lon), parseFloat(result.item.item.lat)];

        if (feature.getGeometry().getType() == 'Point') {
            map.beforeRender(ol.animation.pan({
                duration: 500,
                source: view.getCenter()
            }));
            view.setCenter(feature.getGeometry().getCoordinates());
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
            view.fitExtent(feature.getGeometry().getExtent(), map.getSize());
        }

        $("#result").html(result_template(result.item.item));
        $("#result").addClass('selected');
    }
}).data("ui-autocomplete")._renderItem = function(ul, item) {
    return $("<li>")
        .append("<a>" + item.label + "</a>")
        .appendTo(ul);
};
$("#result").click(function (event) {
    $("#result").removeClass('selected');
});

var icon = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    size: [26, 37],
    src: "image/location74.png"
}));
icon.load();
positionOverlay = new ol.FeatureOverlay({
    map: map,
    style: function() {
        return [new ol.style.Style({
            image: icon
        })];
    }
});
var routingGeolocation = new ol.Geolocation({
    trackingOptions: {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    }
});
routingGeolocation.setProjection(view.getProjection());
var geolocation = new ol.Geolocation({
    trackingOptions: {
        maximumAge: 30000,
        timeout: 27000
    }
});
geolocation.setProjection(view.getProjection());
geolocation.on('change:position', function(event) {
    map.beforeRender(ol.animation.pan({
        duration: 500,
        source: view.getCenter()
    }));
    view.setCenter(geolocation.getPosition());
    self.positionOverlay.setFeatures(new ol.Collection([
        new ol.Feature(new ol.geom.Point(geolocation.getPosition()))
    ]));
});
$("#geolocation").click(function(event) {
    event.preventDefault();
    routingGeolocation.setTracking(false);
    geolocation.setTracking(!geolocation.getTracking());
    if (geolocation.getTracking()) {
        $(event.target).addClass('selected');
    }
    else {
        $(event.target).removeClass('selected');
    }
});

var deviceOrientation = new ol.DeviceOrientation();
//deviceOrientation.bindTo('alpha', map, 'rotation');
deviceOrientation.on('propertychange', function(event) {
    if (event.key == ol.DeviceOrientationProperty.HEADING) {
        view.setRotation(
            deviceOrientation.get(ol.DeviceOrientationProperty.HEADING)
        );
    }
});
$("#orientation").click(function(event) {
    event.preventDefault();
    deviceOrientation.setTracking(!deviceOrientation.getTracking());
    if (deviceOrientation.getTracking()) {
        $(event.target).addClass('selected');
    }
    else {
        view.setRotation(0);
        $(event.target).removeClass('selected');
    }
});

goog.events.listen(goog.global.document, goog.dom.fullscreen.EventType.CHANGE,
    function() {
        var target = $('#' + map.getTarget());
        if (goog.dom.fullscreen.isFullScreen()) {
            $("#fullscreen").addClass('selected');
            target.addClass('fullscreen');
        }
        else {
            $("#fullscreen").removeClass('selected');
            target.removeClass('fullscreen');
        }
    }, false
);
$("#fullscreen").click(function(event) {
    event.preventDefault();
    if (!goog.dom.fullscreen.isSupported()) {
        return;
    }
    if (goog.dom.fullscreen.isFullScreen()) {
        goog.dom.fullscreen.exitFullScreen();
    }
    else {
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
    $('body').append('<div class="layers-list">' + list + '</div>');
    var element = $('.layers-list');
    var pos = $(event.target).offset();
    element.css('right', $(document).width() - pos.left + 10);
});
$("body").on("click", ".layers-list a", function(event) {
    event.preventDefault();
    $(".layers-list").remove();
    $.each(layers, function(name, layer) {
        layer.setVisible(name == event.target.innerHTML);
    });
});

var url = Handlebars.compile('http://graphhopper.com/routing/api/route?point={{end_lat}},{{end_lon}}&point={{start_lat}},{{start_lon}}&type=jsonp&locale=fr-ch&');
var request = new GHRequest('graphhopper.com');
var calculateRouting = true;
var instructions;
var route;
var lessSquaredDist;
function showRoute(pos) {
    var closestFeature = routingSource.getClosestFeatureToCoordinate(pos);
    if (!closestFeature) {
        return;
    }
    var closestGeometry = closestFeature.getGeometry();
    var closestPoint = closestGeometry.getClosestPoint(pos);
    var routingSegment = [pos, closestPoint, closestGeometry.getCoordinates()[1]];
    var dist = ol.coordinate.squaredDistance(pos, closestPoint);
    var lessSquaredDist = Math.min(50, lessSquaredDist, dist);
    if (dist > 2 * lessSquaredDist) {
        calculateRouting = true;
    }
    var coordinates = route.getCoordinates();
    var indexStart = -1;
    var instructionNumber = -1;
    var length;
    for (var i = 0 ; i < coordinates.length ; i++ ) {
        if (indexStart != -1) {
            routingSegment.push(coordinates[i]);
            if (instructionNumber == -1) {
                for (var j = 1 ; j < instructions.coords.length ; j++ ) {
                    dist = ol.coordinate.squaredDistance(
                        instructions.segments[j].getGeometry().getCoordinates()[0], coordinates[i]
                    );
                    if (dist < 1) {
                        routingSegment.push(instructions.coords[j]);
                        instructionNumber = j;
                        length = new ol.geom.LineString(routingSegment).getLength();
                    }
                }
            }
        }
        dist = ol.coordinate.squaredDistance(
            closestGeometry.getCoordinates()[1], coordinates[i]
        );
        if (dist < 1) {
            indexStart = i;
        }
    }

    var nextFeatures = new ol.Collection(routingSource.getAllFeaturesInExtent([
        instructions.coords[instructionNumber][0] - 50,
        instructions.coords[instructionNumber][1] - 50,
        instructions.coords[instructionNumber][0] + 50,
        instructions.coords[instructionNumber][1] + 50,
    ]));
    nextInstructionOverlay1.setFeatures(nextFeatures);
    nextInstructionOverlay2.setFeatures(nextFeatures);

    routingOverlay.setFeatures(new ol.Collection([new ol.Feature(
        new ol.geom.LineString(routingSegment)
    )]));

    var indi = instructions.indications[instructionNumber];
    if (indi == -3)
        indi = "sharp_left";
    else if (indi == -2)
        indi = "left";
    else if (indi == -1)
        indi = "slight_left";
    else if (indi === 0)
        indi = "continue";
    else if (indi == 1)
        indi = "slight_right";
    else if (indi == 2)
        indi = "right";
    else if (indi == 3)
        indi = "sharp_right";
    else if (indi == 4)
        indi = "marker-to";

    $("#routing-instructions").html(routing_template({
        icon: indi,
        dist: Math.round(length),
        instruction: instructions.descriptions[instructionNumber]
    }));
    $("#routing-instructions").addClass('selected');
}
routingGeolocation.on('change:position', function(event) {
    if (view.getCenter()) {
        map.beforeRender(ol.animation.pan({
            duration: 500,
            source: view.getCenter()
        }));
    }
    var pos = routingGeolocation.getPosition();
    view.setCenter(pos);
    self.positionOverlay.setFeatures(new ol.Collection([
        new ol.Feature(new ol.geom.Point(pos))
    ]));

    if (calculateRouting) {
        calculateRouting = false;
        lessSquaredDist = +Infinity;
        ll_pos = ol.proj.transform(pos, 'EPSG:3857', 'EPSG:4326');
        var start = foundCentroid;
        request.doRequest(url({
            start_lon: start[0],
            start_lat: start[1],
            end_lon: ll_pos[0],
            end_lat: ll_pos[1]
        }), function(json) {
            if (json.info.errors) {
                var tmpErrors = json.info.errors;
                console.log(tmpErrors);
                var html = "";
                for (var m = 0; m < tmpErrors.length; m++) {
                    html += "<div class='error'>" + tmpErrors[m].message + "</div>";
                }
                $("#routing-instructions").html(html);
                $("#routing-instructions").addClass('selected');
                return;
            } else if (json.info.routeFound === false) {
                $("#routing-instructions").html('Route not found! Disconnected areas?');
                $("#routing-instructions").addClass('selected');
                return;
            }

            instructions = json.route.instructions;
            route = geojsonformat.readGeometry(json.route.data);
            route.setFlatCoordinates(
                ol.geom.GeometryLayout.XY,
                ol.proj.transform(route.getFlatCoordinates(), 'EPSG:4326', 'EPSG:3857')
            );
            destinationOverlay.setFeatures(new ol.Collection([new ol.Feature(
                new ol.geom.Point(ol.proj.transform(foundCentroid, 'EPSG:4326', 'EPSG:3857'))
            )]));
            instructionsOverlay.setFeatures(new ol.Collection());
            var routingSegments = [];
            var coordinates = route.getCoordinates();
            for (var j = 1 ; j < coordinates.length ; j++) {
                routingSegments.push(new ol.Feature(new ol.geom.LineString(
                    [coordinates[j-1], coordinates[j]]
                )));
            }
            routingSource.clear();
            routingSource.addFeatures(routingSegments);

            instructions.coords = [];
            instructions.segments = [];
            for (var i = 0 ; i < instructions.latLngs.length ; i++) {
                ll = instructions.latLngs[i];
                instructions.coords[i] = ol.proj.transform(
                    [ll[1], ll[0]], 'EPSG:4326', 'EPSG:3857'
                );
                instructions.segments[i] = routingSource.getClosestFeatureToCoordinate(instructions.coords[i]);

                instructionsOverlay.addFeature(new ol.Feature(
                    new ol.geom.Point(instructions.coords[i])
                ));
            }

            showRoute(pos);
        });
    } else {
        showRoute(pos);
    }
});
$("#routing").click(function(event) {
    event.preventDefault();
    if (foundCentroid) {
        // desable geolocation
        geolocation.setTracking(false);
        $("#geolocation").removeClass('selected');
        // hide result
        $("#result").removeClass('selected');
        // enhable routing geolocation
        routingGeolocation.setTracking(!routingGeolocation.getTracking());
        if (routingGeolocation.getTracking()) {
            calculateRouting = true;
            $(event.target).addClass('selected');
        }
        else {
            $(event.target).removeClass('selected');
        }
    } else {
        $("#routing-instructions").html('You should do a search before start the routing.');
        $("#routing-instructions").addClass('selected');
    }
});

$("#routing-instructions").click(function (event) {
    $("#routing-instructions").removeClass('selected');
});
