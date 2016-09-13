var locations = [
    {
        title: "The Museum of Modern Art",
        location: {
            address: "11 W 53rd St, New York, NY 10019"
        }
    },
    {
        title: "Solomon R. Guggenheim Museum",
        location: {
            address: "1071 5th Ave, New York, NY 10128"
        }
    },
    {
        title: "Central Park",
        location: {
            address: "Central Park, NY"
        }
    },
    {
        title: "Bryant Park",
        location: {
            address: "Bryant Park, NY"
        }
    },
    {
        title: "Hunter College",
        location: {
            address: "695 Park Ave, New York, NY 10065"
        }
    },
    {
        title: "Rockefeller Plaza",
        location: {
            address: "45 Rockefeller Plaza, New York, NY 10111"
        }
    },
    {
        title: "Times Square",
        location: {
            address: "Times Square, NY"
        }
    },
    {
        title: "World Trace Center",
        location: {
            address: "285 Fulton St, New York, NY 10007"
        }
    },
    {
        title: "Tao Uptown",
        location: {
            address: "42 E 58th St, New York, NY 10022"
        }
    },
    {
        title: "Le Cirque",
        location: {
            address: "151 E 58th St, New York, NY 10022"
        }
    }
];

var locationModel = function(newLocation) {
    this.title = newLocation.title;
    this.location = newLocation.location;

};

var locationViewModel = function() {
    var self = this;

    self.locationList = ko.observableArray(locations);

    self.markers = ko.observableArray([]);

    self.currentMarker = ko.observable(this.markers()[0]);

    self.locationList().forEach(function (locationObj) {
        var locTitle = locationObj.title;
        var address = locationObj.location.address;
        //test purposes
        console.log(locTitle);
        console.log(address);

        var bounds = new google.maps.LatLngBounds();
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                var position = results[0].geometry.location;
                // Center the map.
                map.setCenter(results[0].geometry.location);
                // Set the zoom level.
                map.setZoom(13);
                // Create marker
                locationObj.marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: locTitle,
                    animation: google.maps.Animation.DROP,
                });
                // add the marker as a property of the location object
                self.markers().push(locationObj.marker);
                // Create an onClick event to open an infoWindow at each marker.
                locationObj.marker.addListener('click', function() {

                    var infoString = locationObj.marker.title;
                    //test
                    console.log(infoString);
                    //populate info window
                    infoWindow.setContent('<div >' + infoString + '</div>');
                    infoWindow.open(map, locationObj.marker);
                    //close infoWindow
                    infoWindow.addListener('closeClick', function() {
                        infoWindow.setContent(null);
                    });
                    // Animate marker.
                    if(locationObj.marker.getAnimation() !== null) {
                        locationObj.marker.setAnimation(null);
                    } else {
                        locationObj.marker.setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(function() {
                            locationObj.marker.setAnimation(null);
                        }, 1400);
                    }
                });

                map.addListener('click', function() {
                    infoWindow.close();
                    locationObj.marker.setAnimation(null);
                });

                bounds.extend(locationObj.marker.position);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
        map.fitBounds(bounds);
    });

    self.openInfoWindow = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    };

    // self.toggleSidebar = function() {
    //     var a = document.getElementById("sidebar");
    //     a.classList.add("visible");
    // }
};

$('#sidebar-btn').click(function(){
    $('#sidebar').toggleClass('open');
    $('#map').toggleClass('adjust');
});

var map;
var infoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.741359, lng: -73.9980244},
        zoom: 12,
        styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [
                { color: "#1BA0C0"},
                { visibility: 'on'}
              ]
            },{
              featureType: 'road.highway',
              elementType: 'geometry.fill',
              stylers: [
                { color: "#F5A36F"},
                { visibility: 'on' }
              ]
            },{
              featureType: 'transit.station',
              stylers: [
                { hue: "#940B47"},
                { weight: 9 }
              ]
            },{
              featureType: 'administrative',
              elementType: 'labels.text.fill',
              stylers: [
                { color: "#AF551B"},
                { visibility: 'on' }
              ]
            }
         ]
    });

    infoWindow = new google.maps.InfoWindow();

    ko.applyBindings(new locationViewModel());
};

