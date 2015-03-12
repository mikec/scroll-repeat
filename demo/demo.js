
window.demoApp = angular.module('demoApp', [
    'ngRoute',
    'litl'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'demo/list/list.html',
        controller: 'ListCtrl',
        controllerAs: 'ctrl'
    }).when('/grid', {
        templateUrl: 'demo/grid/grid.html',
        controller: 'GridCtrl',
        controllerAs: 'ctrl'
    }).when('/no-clipping', {
        templateUrl: 'demo/no-clipping/no-clipping.html',
        controller: 'NoClippingCtrl',
        controllerAs: 'ctrl'
    });
}])

.run(['$route', function($route) { }]);

function generateArray(len) {
    var arr = [];
    for(var i=0; i < len; i++) {
        arr.push({ number: (i+1) });
    }
    return arr;
}