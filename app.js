'use strict';
angular.module('beatspeak',
    ['restangular', 'ngRoute', 'uiGmapgoogle-maps']) //'ui.bootstrap',

    .factory('Globals', function() {
        return {
            mapCounter: 0
        };
    })

    .config(['$routeProvider', '$httpProvider', '$locationProvider', 'RestangularProvider',
        function($routeProvider, $httpProvider, $locationProvider, RestangularProvider) {
            RestangularProvider.setBaseUrl('/rest');

            $routeProvider
                .when('/', {
                    title: 'BeatSpeak | About',
                    templateUrl: 'src/view/about.view.html'
                    //templateUrl: 'src/view/events.view.html'
                })
                .when('/about', {
                    title: 'BeatSpeak | About',
                    templateUrl: 'src/view/about.view.html'
                })
                .when('/media', {
                    title: 'BeatSpeak | Media',
                    templateUrl: 'src/view/media.view.html'
                })
                .when('/events', {
                    title: 'BeatSpeak | Events',
                    templateUrl: 'src/view/events.view.html'
                })
                .when('/contact', {
                    title: 'BeatSpeak | Contact',
                    templateUrl: 'src/view/contact.view.html'
                })
                .otherwise({
                    redirectTo: function() {
                        window.location.replace(
                            window.location.origin + '/');
                    }
                });

            // use the HTML5 History API
            // in coordination with apache
            if(window.history && window.history.pushState){
                $locationProvider.html5Mode(true);
            }

        }
    ])

    .directive('googleMap', function($timeout, $window, $compile, Globals){

        var stub = '<div style="width:368px;height:200px;">'
        var template = "<ui-gmap-google-map id='map{{getIdCounter()}}' center='map.center' zoom='map.zoom'>" +
            "<ui-gmap-marker idKey='getIdCounter()' coords='map.center'></ui-gmap-marker>" +
            "</ui-gmap-google-map>";

        return {
                restrict: 'A',
                scope: {
                    map: '=map',
                },
                replace: false,
                transclude: false,
                template:stub,
                link: function($scope, $element, $attr) {

                    $scope.idCounter = ++Globals.mapCounter;
                    $scope.getIdCounter = function() {
                        return $scope.idCounter;
                    };

                    $scope.redraw = function(swap) {
                        if($scope.map) {
                            $timeout(function() {
                                $scope.idCounter = ++Globals.mapCounter;
                                $element.empty();
                                $element.html(swap ? swap : template);
                                $compile($element.contents(), false)($scope);
                            }, 100, false);
                        }
                    };

                    $scope.$watch("map", function(newValue, oldValue) {
                        //console.log(newValue == oldValue);
                        var id = '#map' + $scope.getIdCounter();

                        if(newValue != oldValue) {
                            $scope.redraw();
                        } else {
                            $scope.redraw(stub);
                        }
                    });

                }
            };

    })

    .controller('AboutController', ['$scope', '$window', '$location', function($scope, $window, $location) {
        $window.ga('send', 'pageview', { page: $location.url() });
    }])

    .controller('MediaController', ['$scope', '$sce', '$window', '$location', function($scope, $sce, $window, $location) {

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        var soundcloudParams = {
            visual:'false',
            liking:'true',
            sharing:'true',
            color:'1e223f',
            show_artwork:'false',
            auto_play:'true',
            start_track:'4'
        };

        var paramsString = [''];
        for(var key in soundcloudParams) {
            paramsString.push(key + '=' + soundcloudParams[key]);
        };

        $scope.soundcloud = {
            width: '359px',
            height: '410px',
            src:'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/131613316' + paramsString.join('&')
        };

        $window.ga('send', 'pageview', { page: $location.url() });

    }])

    .service('EventsService', ['Restangular', '$http', '$sce',
        function(Restangular, $http, $sce) {
            this.getEvents = function(callback) {

                var _gapi = gapi || window['gapi'] || window.gapi;

                var APIKEY = 'AIzaSyDfK94EjiqyzwbZ1bku-dz4WkTVYnUDoKE';

                function loadCalendarApi() {
                    _gapi.client.setApiKey(APIKEY);
                    _gapi.client.load('calendar', 'v3', listUpcomingEvents);
                }

                function listUpcomingEvents() {

                    var request = _gapi.client.calendar.events.list({
                        'calendarId': 's359u0ch0e55rv51c0i8vjbf04@group.calendar.google.com',
                        'timeMin': (new Date()).toISOString(),
                        'showDeleted': false,
                        'singleEvents': true,
                        'maxResults': 10,
                        'orderBy': 'startTime'
                    });

                    request.execute(function(resp) {
                        var events = resp.items;
                        callback.apply(this, [events]);
                    });
                }

                loadCalendarApi();

            };

            this.geoCodeAddress = function(address, callback) {
                var url = 'http://maps.google.com/maps/api/geocode/json';
                url = $sce.trustAsResourceUrl(url += '?sensor=false&address=' + address);
                // console.log('geocode url: ' + url);
                $http.get(url).success(function(mapData) {
                    //console.log('mapData');
                    //console.log(mapData);
                    callback(mapData);
                });
            };
        }
    ])

    .controller('EventsController', ['$scope', '$sce', '$window', '$location', '$timeout', '$element', 'EventsService', function($scope, $sce, $window, $location, $timeout, $element, EventsService) {

        $scope.options = {icon:'url/icon.png'};

        $scope.injectMap = function(index) {

            var eventData = $scope.events[index];

            // let's get the geocode data
            if(eventData.map == null) {
                eventData.map = { center: { latitude: 45, longitude: -73 }, zoom: 17 };
                var address = $scope.events[index].location;
                // console.log('address: ' + address);
                EventsService.geoCodeAddress(address, function(mapData){

                    var location = mapData.results[0].geometry.location;
                    eventData.map.center.latitude = location.lat;
                    eventData.map.center.longitude = location.lng;

                });
            }

        }

        if( !$scope.events ) {
            EventsService.getEvents(function(events){
                // console.log(events);
                $scope.events = [];

                // clean things up
                for(var i in events) {
                    var event = events[i];
                    // only show public events
                    if(event.visibility == 'public') {

                        var viewEvent = {
                            //isExpanded:     $scope.events.length == 0 ? 'in' : null,
                            summary:        event.summary.replace(/BeatSpeak at /gi, ''),
                            location:       event.location,
                            startDateShort: moment(event.start.dateTime).format('MM/DD/YY'),
                            endDateShort:   moment(event.end.dateTime).format('MM/DD/YY'),
                            startDate:      moment(event.start.dateTime).format('MMMM Do YYYY, h:mm a'),
                            endDate:        moment(event.end.dateTime).format('MMMM Do YYYY, h:mm a'),
                            startTime:      moment(event.start.dateTime).format('h:mm a'),
                            endTime:        moment(event.end.dateTime).format('h:mm a'),
                            dateFullFormat: moment(event.start.dateTime).format('MMMM Do YYYY, h:mm a') + ' - ' + moment(event.end.dateTime).format('h:mm a'),
                            map:            null
                        };

                        $scope.events.push(viewEvent);

                    }
                }

                $scope.$apply();

            });
        }

        //for(var i in $scope.events) {
        //    if($scope.events[i].isExpanded) {
        //        $scope.injectMap[i];
        //    }
        //}

        //

        $timeout(function() {
            $element.find('#toggle-trigger-0').trigger('click');
        }, 1000, false);


        $window.ga('send', 'pageview', { page: $location.url() });

    }])






;