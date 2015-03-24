
window.demoApp = angular.module('demoApp', [
    'ngRoute',
    'ngAnimate',
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
    }).when('/detect-clipping', {
        templateUrl: 'demo/detect-clipping/detect-clipping.html',
        controller: 'DetectClippingCtrl',
        controllerAs: 'ctrl'
    }).when('/placeholders', {
        templateUrl: 'demo/placeholders/placeholders.html',
        controller: 'PlaceholdersCtrl',
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