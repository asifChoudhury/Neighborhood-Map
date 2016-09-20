// Location array with information.
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
        title: "Grand Central Terminal",
        location: {
            address: "89 E 42nd St, New York, NY 10017"
        }
    },
    {
        title: "Empire State Building",
        location: {
            address: "350 5th Ave, New York, NY 10118"
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
        title: "St. Patrick's Cathedral",
        location: {
            address: "456 Madison Avenue, New York, NY 10022"
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

// Location object model.
var locationModel = function(newLocation) {
    this.title = newLocation.title;
    this.location = newLocation.location;
};

// Location view model.
var locationViewModel = function() {
    var self = this;

    // Create an observable location array.
    self.locationList = ko.observableArray(locations);

    // Create an observable markers array.
    self.markers = ko.observableArray([]);

    /*
       Go through each location in the observable array and
       use geocode to get the latlng from the address and
       create a marker for each location and populate infoWindow
       with data from foursquare when marker or list item is clicked.
     */
    self.locationList().forEach(function (locationObj) {
        var locTitle = locationObj.title;
        var address = locationObj.location.address;

        var bounds = new google.maps.LatLngBounds();
        var geocoder = new google.maps.Geocoder();

        // Get latlng from address.
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                var position = results[0].geometry.location;
                var city;
                var state;
                // Get city and state from the returned results.
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
                // Initialize city and state.
                var cityState = city + ", " + state;

                // Center the map.
                map.setCenter(results[0].geometry.location);

                // Set the zoom level.
                if(window.innerWidth > 500) {
                    map.setZoom(13);
                } else {
                    map.setZoom(12);
                }

                // Create marker.
                locationObj.marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: locTitle,
                    animation: google.maps.Animation.DROP,
                });

                // Add the marker as a property of the location object.
                self.markers().push(locationObj.marker);

                // Create an onClick event to open an infoWindow at each marker.
                locationObj.marker.addListener('click', function() {
                    // Changes the center of the map to the given LatLng.
                    map.panTo(locationObj.marker.getPosition());

                    // Build the foursquare url.
                    var fourSquareUrl = "https://api.foursquare.com/v2/venues/search?near=" + cityState + "&query=" + locTitle + "&client_id=VKDIKDKB5OJFMVYONXNAIVNYIHCQYAUYAE44UMNAR2FDH5N0&client_secret=WXSBDUCXPW1K0OXGQAHH31LOI2DX52HRVSJC3YQVQQAZHJ4T&v=20130918";

                    // Variables to store data returned from foursquare request.
                    var categoryName;
                    var address;
                    var phone;
                    var website;

                    // Send the request to foursquare for data.
                    $.getJSON(fourSquareUrl, function(data) {
                        categoryName = data.response.venues[0].categories[0].name;
                        address = data.response.venues[0].location.formattedAddress;
                        phone = data.response.venues[0].contact.formattedPhone;
                        website = data.response.venues[0].url;

                        // If no information can be obtained from foursquare, then initialize the variables with placeholder information.
                        var info = "Not available";
                        if(!categoryName) {
                            categoryName = info;
                        }
                        if(!address) {
                            address = info;
                        }
                        if(!phone) {
                            phone = info;
                        }
                        if (!website) {
                            website = info;
                        }

                        // Set content of the infoWindow with foursquare data.
                        infoWindow.setContent('<div class="bold infoWindow">' + locTitle +'</div>' +
                                              '<div class="infoWindow">' + categoryName +'</div>' +
                                              '<div class="infoWindow"><Span class="bold">Address:  </span>' + address +'</div>' +
                                              '<div class="infoWindow"><span class="bold">Phone:  </span>' + '<a href="' + phone + '">' + phone + '</a></div>' +
                                              '<div class="infoWindow"><span class=bold>Website:  </span>' + '<a href="' + website + '">' + website + '</a></div>' +
                                              '<div class="infoWindow-footer">provided by <span class="footer-color">Foursquare</span></div>');
                        // Infowindow operations and marker animations.
                        infoWindowAction();
                    })
                        // Set content of the infoWindow in case foursquare request results in an error.
                        .fail(function() {
                            infoWindow.setContent('<div class=bold>' + locTitle +'</div><br><br><em><b>FourSquare</b> cannot load at this time.</em>');
                            infoWindowAction();
                        });
                });

                // Infowindow operations and marker animations.
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
                        locationObj.marker.setIcon(visitedMarker);
                        setTimeout(function() {
                            locationObj.marker.setAnimation(null);
                        }, 1400);
                    }
                }

                // Change the default marker when a marker is visited or highlighted.
                var visitedMarker = makeMarkerIcon('AF551B');

                /*
                   Create a highlighted marker color for when the user
                   mouses over the marker.
                */
                var highlightedMarker = makeMarkerIcon('FFFF24');

                /*
                   Two event listeners - one for mouseover, one for mouseout,
                   to change the colors back and forth.
                */
                locationObj.marker.addListener('mouseover', function() {
                    this.setIcon(highlightedMarker);
                });
                locationObj.marker.addListener('mouseout', function() {
                    this.setIcon(visitedMarker);
                });

                // Close infoWindow and set marker animarion to null when map is clicked.
                map.addListener('click', function() {
                    infoWindow.close();
                    locationObj.marker.setAnimation(null);
                });

                // Extend the bound to reflect marker position.
                bounds.extend(locationObj.marker.position);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });

        // Sets the viewport to contain the given bounds.
        map.fitBounds(bounds);
    });

    // Create an observable for sidebar.
    self.showSidebar = ko.observable(false);

    // Create an observable for map adjusment.
    self.mapAdjust = ko.observable(false);

    // Trigger this event on the marker when clicked.
    self.openInfoWindow = function(location) {
        google.maps.event.trigger(location.marker, 'click');
        self.toggleSidebar();
    };

    /*
       If sidebar-btn is clicked sidebar opens and map adjusts.
       If title is clicked which resides in the sidebar; sidebar closes and map readjusts.
    */
    self.toggleSidebar = function() {
        if(self.showSidebar() == true) {
            self.showSidebar(false);
            self.mapAdjust(false);
        } else {
            self.showSidebar(true);
            self.mapAdjust(true);
        }
    };

    // Create an observable filter variable.
    self.filter = ko.observable("");

    // Filter the items using the filter text.
    self.filteredLocations = ko.computed(function() {
        // Take the observable filter and convert it to lowercase.
        var filter = this.filter().toLowerCase();

        /*
           If filter variable has no value or is undefined return
           the default list with markers otherwise return the filtered
           list and hide the markers.
        */
        if (!filter) {
            self.markers().forEach(function(markerItem) {
                markerItem.setVisible(true);
            });
            return this.locationList();
        } else {
            return ko.utils.arrayFilter(this.locationList(), function(location) {
                /*
                   Go through each marker and if there's a match
                   set the marker to be visible
                */
                self.markers().forEach(function(markerItem) {
                    var stringToMatch = markerItem.title.toLowerCase();

                    // If there's match, set marker to be visible, otherwise hide it.
                    if(stringToMatch.search(filter) >= 0) {
                        markerItem.setVisible(true);
                    } else {
                        markerItem.setVisible(false);
                    }
                });

                // If there's a match update the list accordingly.
                var string = location.title.toLowerCase();
                return string.search(filter) >= 0;
            });
        }
    }, this);
};

// Global variables.
var map;
var infoWindow;

// Initialize google maps with the given latlng and styles.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.741359, lng: -73.9980244},
        zoom: 13,
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

    // Initialize infoWindow.
    infoWindow = new google.maps.InfoWindow();

    // Apply bindings to get knockout to work.
    ko.applyBindings(new locationViewModel());
}

// In case of error, alert the user.
function googleError () {
     alert("Google Maps failed to load!!!");
}

/*
   This function takes in a COLOR, and then creates a new marker
   icon of that color. The icon will be 21 px wide by 34 px high, have an origin
   of 0, 0 and be anchored at 10, 34).

   Attribution: Udacity "Google Maps APIS" course.
*/
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
