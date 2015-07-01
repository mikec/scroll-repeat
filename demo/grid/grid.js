window.demoApp.controller('GridCtrl',
['$http', '$rootScope', '$filter',
function($http, $rootScope, $filter) {

    $rootScope.nav = 'grid';

    var $this = this;

    this.loading = true;

    $http.get('demo/flights.json')
        .then(function(resp) {

            var set = [];
            var n = 0;
            for(var i=0; i < resp.data.length * 4; i++) {
                if(n == resp.data.length) n = 0;
                set[i] = angular.extend({}, resp.data[n]);
                set[i].record_number = (i + 1);
                n++;
            }
            console.log('ADDED ' +
                    $filter('number')(set.length) + ' records');

            $this.flights = set;

            $this.loading = false;
        });

}]);