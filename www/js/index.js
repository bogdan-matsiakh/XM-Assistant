(function() {
    var LeafIcon = L.Icon.extend({
            options: {
                shadowUrl: 'img/marker-shadow.png',
                iconSize:     [29, 41],
                iconAnchor:   [9, 21],
                popupAnchor:  [0, -14]
            }
        }),
        greenIcon = new LeafIcon({iconUrl: 'img/marker-icon_green.png'}),
        blueIcon = new LeafIcon({iconUrl: 'img/marker-icon.png'}),
        greyIcon = new LeafIcon({iconUrl: 'img/marker-icon-grey.png'}),
        map;

    function onLocationError(e) {
        alert(e.message);
    }
    function onLocationFound(e) {
        xhr.get('http://ec2-52-29-134-247.eu-central-1.compute.amazonaws.com:8080/sprut-api/portals').success(onPortalsReceived);
        
        // markerClusters.on('clustermouseover', function(a) {
        //     var markers = a.layer.getAllChildMarkers(),
        //         eCounter = 0,
        //         rCounter = 0;
        //     markers.forEach(function(marker) {
        //         if (marker.options.team === 'E') {
        //             eCounter++;
        //         } else {
        //             rCounter++
        //         }
        //     })
        //     markerClusterPopup = L.popup()
        //         .setLatLng(a.layer._cLatLng)
        //         .setContent('<p>Enlightened portals: '+ eCounter + '<br />Resistance portals: '+ rCounter + '</p>')
        //         .openOn(map);
        // });
    }

    function onPortalsReceived(portals) {
        var radius = 10,
            markerClusters = L.markerClusterGroup({
                iconCreateFunction: function(cluster) {
                    var childCount = cluster.getChildCount(),
                        iconSize = childCount > 500 ? 'large' : (childCount > 50 ? 'medium' : 'small'),
                        markers = cluster.getAllChildMarkers(),
                        eCounter = 0,
                        rCounter = 0,
                        nCounter = 0;
                    
                    markers.forEach(function(marker) {
                        if (marker.options.team === 'E') {
                            eCounter++;
                        } else if (marker.options.team === 'R') {
                            rCounter++;
                        } else {
                            nCounter++;
                        }
                    })
                    return L.divIcon({
                        html: '<div class="marker-container"><b class="enlightened-text">E: ' + eCounter + '</b><b class="resistance-text">R: ' + rCounter + '</b><b class="neutral-text">N: ' + nCounter + '</b></div>',
                        className: 'marker-cluster marker-cluster-' + iconSize,
                        iconSize: null
                    });
                }
            }),
            markerClusterPopup;
        
        portals.forEach(function(portal) {
            var marker,
                team = portal.team,
                opts = {
                    icon: (team === 'E' ? greenIcon : (team === 'R' ? blueIcon : greyIcon)),
                    team: team,
                    title: portal.title
                };
            marker = L.marker([portal.latE6 / 1e6, portal.lngE6 / 1e6], opts);
            marker.bindPopup();
            markerClusters.addLayer(marker);
            marker.on('click', onMarkerClick(portal));
        });
        map.addLayer(markerClusters);
    }

    function onMarkerClick(portal) {
        return function(a) {
            var popup = L.popup()
                .setLatLng([portal.latE6 / 1e6, portal.lngE6 / 1e6])
                .setContent('<p><div class="hexagon">' + portal.level + '</div> '+ portal.title + '<span> ( ' + portal.owner + ' ) </span></p>')
                .openOn(map);
        }
    }
    function deviceReady(id) {
        map = L.map('map', {
            center: [0.01, 0.01],
            minZoom: 2,
            zoom: 2
        });

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
            maxZoom: 18,
            id: 'mapbox.streets'
        }).addTo(map);

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        map.locate({setView: true, maxZoom: 16});
    }
     
    return {
        initialize: function() {
            this.bindEvents();
        },
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },
        onDeviceReady: deviceReady
    };
})().initialize();

