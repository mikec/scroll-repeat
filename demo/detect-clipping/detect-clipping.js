window.demoApp.controller('DetectClippingCtrl',
['$http', '$scope', '$rootScope', '$timeout', '$window',
function($http, $scope, $rootScope, $timeout, $window) {

    $rootScope.nav = 'detect-clipping';

    var $this = this;

    this.loading = true;

    $http.get('demo/flights.json')
        .then(function(resp) {
            for(var i=0; i < resp.data.length; i++) {
                resp.data[i].record_number = (i + 1);
            }
            $this.flights = resp.data;
            $this.loading = false;
        });


    // set this.clipping to true when clipping occurs,
    // and set it back to false when scrolling stops

    this.clipping = false;

    var clipEndTimeout;

    $scope.$watch('scrollRepeatClippingBottom', function() {
        setClipping();
    });

    $scope.$watch('scrollRepeatClippingTop', function() {
        setClipping();
    });

    angular.element($window).bind('scroll', function() {
        $timeout.cancel(clipEndTimeout);
        clipEndTimeout = $timeout(function() {
            $this.clipping = false;
        }, 1000);
    });

    function setClipping() {
        if(($scope.scrollRepeatClippingTop || $scope.scrollRepeatClippingBottom) &&
                !$this.clipping)
        {
            $this.clipping = true;
        }
    }

}]);