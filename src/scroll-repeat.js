/*
 * scrollRepeat directive
 *
 * //
 *
 */

angular.module('litl', []).directive('scrollRepeat', [
function() {
    return {
        compile: function(tElement, tAttrs) {
            var blankTile = angular.element('<div class="item blank">' +
                                                '<div class="resizer"></div>' +
                                            '</div>');
            var blankContent = angular.element('<div class="content"></div>');
            blankTile.append(blankContent);

            var gridTile = angular.element('<div class="item repeat">' +
                                            '<div class="resizer"></div>' +
                                           '</div>');

            var expression = tAttrs.scrollRepeat;
            gridTile.attr('ng-repeat', expression);

            // copied from ngRepeat
            var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/); // jshint ignore:line
            var rhs = match[2];

            var content = angular.element('<div class="content"></div>');
            content.append(tElement.contents());
            gridTile.append(content);

            tElement.html('');
            tElement.append(blankTile);
            tElement.append(gridTile);

            return function(scope) {

                scope.gridItemWidth = blankContent.prop('offsetWidth');

                scope.$watchCollection(rhs, function(array) {
                    scope.arrayLength = array ? array.length : null;
                });

            };
        }
    };
}]);
