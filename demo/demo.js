
window.demoApp = angular.module('demoApp', [
    'ngRoute',
    'litl'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'basic/basic.html',
        controller: 'BasicCtrl',
        controllerAs: 'ctrl'
    }).when('/grid', {
        templateUrl: 'grid/grid.html',
        controller: 'GridCtrl',
        controllerAs: 'ctrl'
    });
}])

.run(['$route', function($route) {

}]);

function generateArray(len) {
    var arr = [];
    for(var i=0; i < len; i++) {
        arr.push({ number: (i+1) });
    }
    return arr;
}