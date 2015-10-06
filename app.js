'use strict';
angular.module('beatspeak',
    ['restangular', 'ngRoute']) //'ui.bootstrap',

    .config(['$routeProvider', '$httpProvider', '$locationProvider', 'RestangularProvider',
        function($routeProvider, $httpProvider, $locationProvider, RestangularProvider) {
            RestangularProvider.setBaseUrl('/rest');

            $routeProvider
                .when('/', {
                    title: 'BeatSpeak | About',
                    templateUrl: 'src/view/about.view.html'
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
                    title: 'BeatSpeak | About',
                    templateUrl: 'src/view/about.view.html'
                });

            // use the HTML5 History API
            // in coordination with apache
            if(window.history && window.history.pushState){
                $locationProvider.html5Mode(true);
            }

        }
    ])

    .controller('MediaController', ['$scope', '$sce', function($scope, $sce) {

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

    }])

    .service('EventsService', ['Restangular',
        function(Restangular) {
            this.getEvents = function(callback) {

                var _gapi = gapi || window['gapi'] || window.gapi;

                //$scope.trustSrc = function(src) {
                //    return $sce.trustAsResourceUrl(src);
                //};

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

            }
        }
    ])

    .controller('EventsController', ['$scope', '$sce', 'EventsService', function($scope, $sce, EventsService) {

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
                            summary:        event.summary,
                            location:       event.location,
                            startDateShort: moment(event.start.dateTime).format('ll'),
                            endDateShort:   moment(event.end.dateTime).format('ll'),
                            startDate:      moment(event.start.dateTime).format('MMMM Do YYYY, h:mm a'),
                            endDate:        moment(event.end.dateTime).format('MMMM Do YYYY, h:mm a'),
                            startTime:      moment(event.start.dateTime).format('h:mm a'),
                            endTime:        moment(event.end.dateTime).format('h:mm a')
                        };

                        $scope.events.push(viewEvent);

                    }
                }

                $scope.$apply();

            });
        }

        //if (events.length > 0) {
        //    for (i = 0; i < events.length; i++) {
        //        var event = events[i];
        //        ///console.log(event);
        //
        //        var when = event.start.dateTime;
        //        if (!when) {
        //            when = event.start.date;
        //        }
        //        appendPre(event.summary);
        //        appendPre(new Date(when).toDateString());
        //    }
        //} else {
        //    appendPre('No upcoming events found.');
        //}
        //function appendPre(message) {
        //    var pre = document.getElementById('beatSpeakEvents');
        //    var textContent = document.createTextNode(message);
        //    pre.appendChild(textContent);
        //    pre.appendChild(document.createElement('br'));
        //}

    }])






;