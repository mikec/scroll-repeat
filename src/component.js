
var myModule = angular.module('my-module', []);

myModule.directive('myDirective', [function() {
    return {
        template: '<div>My Directive</div>',
        link: function(scope) {
            scope.foo = 'bar';
        }
    };
}]);