'use strict';
angular.module('beatspeak',
    ['restangular', 'ngRoute']) //'ui.bootstrap',

    .config(['$routeProvider', '$httpProvider', 'RestangularProvider',
        function($routeProvider, $httpProvider, RestangularProvider) {
            RestangularProvider.setBaseUrl('/rest');

            $routeProvider
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

    }]);