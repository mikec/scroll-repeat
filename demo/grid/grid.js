window.demoApp.controller('GridCtrl',
['$http', '$rootScope',
function($http, $rootScope) {

    $rootScope.nav = 'grid';

    var $this = this;

    this.loading = true;

    $http.get('demo/flights.json')
        .then(function(resp) {
            for(var i=0; i < resp.data.length; i++) {
                resp.data[i].record_number = (i + 1);
            }

            //TMP
            var smallSet = [];
            for(var i=0; i < 10000; i++) {
                smallSet.push(resp.data[i]);
            }

            //$this.flights = resp.data;
            $this.flights = smallSet;

            $this.loading = false;
        });

}]);