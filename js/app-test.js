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
        title: "World Trade Center",
        location: {
            address: "285 Fulton St, New York, NY 10007"
        }
    },
    {
        title: "Tao Restaurant",
        location: {
            address: "42 E 58th St, New York, NY 10022"
        }
    },
    {
        title: "Le Cirque Restaurant",
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
        // console.log(locTitle);
        // console.log(address);

        var bounds = new google.maps.LatLngBounds();
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                var position = results[0].geometry.location;
                var city;
                var state;
                results[0].address_components.forEach( function(element) {
                    element.types.forEach( function(typeElement) {
                        if(typeElement == "sublocality_level_1") {
                            city = element.long_name;
                        }
                        if(typeElement == "administrative_area_level_1") {
                            state = element.long_name;
                        }
                    });
                });
                var cityState = city + ", " + state;
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
                    map.panTo(locationObj.marker.getPosition());
                    var fourSquareUrl = "https://api.foursquare.com/v2/venues/search?near=" + cityState + "&query=" + locTitle + "&client_id=VKDIKDKB5OJFMVYONXNAIVNYIHCQYAUYAE44UMNAR2FDH5N0&client_secret=WXSBDUCXPW1K0OXGQAHH31LOI2DX52HRVSJC3YQVQQAZHJ4T&v=20130918";
                    var categoryName;
                    var address;
                    var phone;
                    var website;
                    $.getJSON(fourSquareUrl, function(data) {
                        categoryName = data.response.venues[0].categories[0].name;
                        address = data.response.venues[0].location.formattedAddress;
                        phone = data.response.venues[0].contact.formattedPhone;
                        website = data.response.venues[0].url;

                        if(!phone) {
                            phone = "No Phone";
                        }
                        if (!website) {
                            website = "No Website";
                        }

                        infoWindow.setContent('<div class="bold infoWindow">' + locTitle +'</div>' +
                                              '<div class="infoWindow">' + categoryName +'</div>' +
                                              '<div class="infoWindow"><Span class="bold">Address:  </span>' + address +'</div>' +
                                              '<div class="infoWindow"><span class="bold">Phone:  </span>' + '<a href="' + phone + '">' + phone + '</a></div>' +
                                              '<div class="infoWindow"><span class=bold>Website:  </span>' + '<a href="' + website + '">' + website + '</a></div>');
                        infoWindowAction();
                    })
                        .fail(function() {
                            infoWindow.setContent('<div class=bold>' + locTitle +'</div>');
                            infoWindowAction();
                            //alert( "Foursquare can't be reached for information!" );
                        });
                });

                function infoWindowAction() {
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
                            locationObj.marker.setIcon(defaultIcon);
                            setTimeout(function() {
                                locationObj.marker.setAnimation(null);
                            }, 1400);
                        }
                }

                // Style the markers a bit. This will be our listing marker icon.
                var defaultIcon = makeMarkerIcon('AF551B');

                // Create a "highlighted location" marker color for when the user
                // mouses over the marker.
                var highlightedIcon = makeMarkerIcon('FFFF24');

                // Two event listeners - one for mouseover, one for mouseout,
                // to change the colors back and forth.
                locationObj.marker.addListener('mouseover', function() {
                    this.setIcon(highlightedIcon);
                });
                locationObj.marker.addListener('mouseout', function() {
                    this.setIcon(defaultIcon);
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

    self.filter = ko.observable("");

    //filter the items using the filter text
    self.filteredLocations = ko.computed(function() {
        var filter = this.filter().toLowerCase();
        if (!filter) {
            return this.locationList();
        } else {
            return ko.utils.arrayFilter(this.locationList(), function(location) {
                self.markers().forEach(function(markerItem) {
                    var stringToMatch = markerItem.title.toLowerCase();
                    if(stringToMatch.search(filter) >= 0) {
                        markerItem.setVisible(true);
                    } else {
                        markerItem.setVisible(false);
                    }
                });
                var string = location.title.toLowerCase();
                return string.search(filter) >= 0;
            });
        }
    }, this);
};

$('body').on('click', '#sidebar-btn', function() {
    toggleSidebarAndMap();
});

$('body').on('click', '#title', function() {
    if (window.innerWidth < 1260) {
        toggleSidebarAndMap();
    }
});

function toggleSidebarAndMap () {
    $('#sidebar').toggleClass('open');
    $('#map').toggleClass('adjust');
}

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
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry.fill',
              stylers: [
                { color: "#83ba13"},
                { visibility: 'on' }
              ]
            },
            {
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

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
//
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34)
    );

    return markerImage;
}

// var url = 'https://api.foursquare.com/v2/venues/search?near="' + cityState + '"&query="' + titleLoc + '"&client_id=VKDIKDKB5OJFMVYONXNAIVNYIHCQYAUYAE44UMNAR2FDH5N0&client_secret=WXSBDUCXPW1K0OXGQAHH31LOI2DX52HRVSJC3YQVQQAZHJ4T&v=YYYYMMDD';

// $.getJSON(url, function() {


// });

