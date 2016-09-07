var AppViewModel = function() {
    var self = this;

    // Hard coded locations
    self.locations = [
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
};

// Global map variable.
var map;

var markers = [];

// Initialize the map.
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

    var bounds = new google.maps.LatLngBounds();
    var largeInfoWindow = new google.maps.InfoWindow();
    var geocoder = new google.maps.Geocoder();

    // Create a new instance of the AppViewModel
    var appViewModelCopy = new AppViewModel();

    /* First, get the title and address from locations array.
     * Then use geocoding services to get the latlng.
     * And then place marker on map.
     */
    for (var i = 0; i < appViewModelCopy.locations.length; i++) {
        var title = appViewModelCopy.locations[i].title;
        var address = appViewModelCopy.locations[i].location.address;
        // For testing purposes
        console.log(title);
        console.log(address);
        // get geocode
        populateMap(geocoder, address, title, largeInfoWindow, bounds);
    }
}

// Get latlng from address and place markers on map.
function populateMap(geocoder, address, title, largeInfoWindow, bounds) {
    // Get latlng from address and place markers on map.
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
            var position = results[0].geometry.location;
            // Center the map.
            map.setCenter(results[0].geometry.location);
            // Set the zoom level.
            map.setZoom(13);
            // Create marker
            var marker = new google.maps.Marker({
              map: map,
              position: position,
              title: title,
              animation: google.maps.Animation.DROP,
            });
            // Add the marker to the marker array
            markers.push(marker);
            // Create an onClick event to open an infoWindow at each marker.
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfoWindow);
                // Animate marker.
                if(marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            });

            map.addListener('click', function() {
                largeInfoWindow.close();
                marker.setAnimation(null);
            });

            bounds.extend(marker.position);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
    map.fitBounds(bounds);
}

function populateInfoWindow(marker, infoWindow) {
    if(infoWindow.marker != marker) {
        infoWindow.marker = marker;
        infoWindow.setContent('<div>' + marker.title + '</div>');
        infoWindow.open(map, marker);

        infoWindow.addListener('closeClick', function() {
            infoWindow.setContent(null);
        });
    }
}

ko.applyBindings(new AppViewModel());
