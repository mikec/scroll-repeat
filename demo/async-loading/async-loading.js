window.demoApp.controller('AsyncLoadingCtrl',
['$http', '$rootScope', '$timeout',
function($http, $rootScope, $timeout) {

    $rootScope.nav = 'grid';

    var $this = this;

    var data;

    this.loading = true;
    this.flights = [];

    $http.get('demo/flights.json')
        .then(function(resp) {
            for(var i=0; i < resp.data.length; i++) {
                resp.data[i].record_number = (i + 1);
            }

            data = resp.data;

            addData();

            $this.loading = false;
        });

    function addData(c) {
        if(!c) c = 0;
        else if (c > 10000) return;

        var newData = [];
        for(var i=c; i < c+50; i++) {
            newData.push(data[i]);
        }
        $this.flights.push.apply($this.flights, newData);
        $timeout(function() {
            addData(c + 50);
        }, 1000);
    }

}]);