/*
 * scrollRepeat directive
 *
 * //
 *
 */

angular.module('litl', []).directive('scrollRepeat', [
function() {

    var idx = 0;
    var numRenderedItems = 3;

    return {
        compile: function(tElement, tAttrs) {
            var item = angular.element('<div class="item repeat"></div>');
            /*var item = angular.element('<div class="item repeat">' +
                                            '<div class="resizer"></div>' +
                                           '</div>');*/

            var expression = tAttrs.scrollRepeat;

            var content = angular.element('<div class="content"></div>');
            content.append(tElement.contents());
            item.append(content);

            tElement.html('');
            tElement.append('<div style="background:red"></div>');
            tElement.append(item);
            tElement.append('<div style="background:blue"></div>');

            // copied from ngRepeat
            var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/); // jshint ignore:line
            var lhs = match[1];
            var rhs = match[2];

            var itemsName = 'scroll_repeat_items_' + idx;
            idx++;

            //item.attr('ng-repeat', lhs + ' in ' + itemsName);

            item.attr('ng-repeat', expression + ' | limitTo:lim | limitTo: -' + numRenderedItems);

            return function(scope, element) {

                var topSpacer = angular.element(element.children()[0]);
                var bottomSpacer = angular.element(element.children()[1]);

                var cursor = 0;
                var itemHeight = 0;
                var numItems = 0;
                var firstLoad = true;
                setCursor(0);

                scope.$watchCollection(rhs, function(itemArray) {
                    if(itemArray) {
                        numItems = itemArray.length;
                    }
                    if(firstLoad) {
                        updateItemHeight();
                        firstLoad = false;
                    }
                    updateUI();
                });

                function setCursor(n) {
                    cursor = n;
                    scope.lim = numRenderedItems + n;
                    updateUI();
                }

                function updateUI() {
                    topSpacer.css('height', getTopSpacerHeight() + 'px');
                    bottomSpacer.css('height', getBottomSpacerHeight() + 'px');
                }

                function updateItemHeight() {
                    itemHeight = element.children()[1].offsetHeight;
                }

                function getTopSpacerHeight() {
                    return cursor * itemHeight;
                }

                function getBottomSpacerHeight() {
                    return (numItems - numRenderedItems - cursor) * itemHeight;
                }

                // DEBUGGING
                element.bind('click', function() {
                    scope.$apply(function() {
                        setCursor(cursor + 1);
                    });
                });

            };
        }
    };
}]);
