
var myModule = angular.module('my-module', []);

myModule.directive('myDirective', [function() {
    return {
        template: '<div class="my-directive">My Directive</div>',
        link: function(scope) {
            scope.foo = 'bar';
        }
    };
}]);