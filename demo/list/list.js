window.demoApp.controller('ListCtrl',
['$http', '$rootScope',
function($http, $rootScope) {

    $rootScope.nav = 'list';

    var $this = this;

    this.loading = true;

    $http.get('flights.json')
        .then(function(resp) {
            for(var i=0; i < resp.data.length; i++) {
                resp.data[i].record_number = (i + 1);
            }
            $this.flights = resp.data;
            $this.loading = false;
        });

}]);