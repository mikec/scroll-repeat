window.demoApp.controller('NoClippingCtrl',
['$http', '$scope', '$rootScope', '$timeout',
function($http, $scope, $rootScope, $timeout) {

    $rootScope.nav = 'no-clipping';

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

}]);