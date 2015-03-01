/*
 * scrollRepeat directive
 *
 * //
 *
 */

angular.module('litl', []).directive('scrollRepeat', ['$window', '$timeout',
function($window, $timeout) {

    var numRenderedItems = 50;
    var numBufferItems;

    var w = angular.element($window);

    var wHeight, wWidth;
    var resizeDebounce;
    var resizeDebounceTime = 500;
    var resizeHandler;

    var wScrollTop;
    var scrollDebounce;
    var scrollDebounceTime = 500;
    var scrollHandler;

    updateWindowSizes();

    w.bind('resize', function() {
        if(angular.isUndefined(wHeight) ||
            angular.isUndefined(wWidth) ||
                angular.isUndefined(resizeDebounce))
        {
            updateWindowSizes();
        }
        $timeout.cancel(resizeDebounce);
        resizeDebounce = $timeout(updateWindowSizes, resizeDebounceTime);
    });

    w.bind('scroll', function() {
        wScrollTop = $window.document.body.scrollTop;
        if(angular.isUndefined(scrollDebounce)) {
            scrollDebounce = $timeout(function() {
                if(scrollHandler) scrollHandler();
                scrollDebounce = undefined;
            }, scrollDebounceTime);
        }
        if(scrollHandler) scrollHandler(true);
    });

    function updateWindowSizes() {
        wWidth = w.prop('innerWidth');
        wHeight = w.prop('innerHeight');
        resizeDebounce = undefined;
        if(resizeHandler) resizeHandler();
    }

    return {
        compile: function(tElement, tAttrs) {
            var item = angular.element('<div class="scroll-repeat-item"></div>');

            var expression = tAttrs.scrollRepeat;

            var content = angular.element('<div class="scroll-repeat-item-content"></div>');
            content.append(tElement.contents());
            item.append(content);

            tElement.html('');
            tElement.append(item);

            // copied from ngRepeat
            var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/); // jshint ignore:line
            var rhs = match[2];

            item.attr('ng-repeat', expression + ' | limitTo:lim | limitTo: -' + numRenderedItems);

            return function(scope, element) {

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
                        updateNumBufferedItems();
                        firstLoad = false;
                    }
                    updateUI();
                });

                scrollHandler = function(bounced) {
                    if(!bounced) {
                        updateCursor();
                    }
                };

                resizeHandler = function() {
                    updateNumBufferedItems();
                };

                function setCursor(n) {
                    cursor = n;
                    scope.lim = numRenderedItems + n;
                    updateUI();
                }

                function updateCursor() {
                    var c = Math.round(wScrollTop / itemHeight) - numBufferItems;
                    if(c < 0) c = 0;
                    var maxC = numItems - numRenderedItems;
                    if(c > maxC) c = maxC;
                    setCursor(c);
                }

                function updateUI() {
                    element.css('padding-top', getTopSpacerHeight() + 'px');
                    element.css('padding-bottom', getBottomSpacerHeight() + 'px');
                }

                function updateNumBufferedItems() {
                    var numItemsOnScreen = Math.round(wHeight / itemHeight);
                    numBufferItems = Math.round((numRenderedItems - numItemsOnScreen) / 2);
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

            };
        }
    };
}]);
