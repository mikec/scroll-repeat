/*
 * scrollRepeat directive
 *
 * //
 *
 */

angular.module('litl', []).directive('scrollRepeat', ['$window', '$timeout',
function($window, $timeout) {

    var bufferAmt = 30;
    var numRenderedItems = 1;
    var numBufferItems;

    var w = angular.element($window);

    var wHeight, wWidth;
    var resizeDebounce;
    var resizeDebounceTime = 500;
    var resizeHandler;

    var wScrollTop = 0;
    var scrollDebounce;
    var scrollDebounceTime = 250;
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
        wWidth = $window.innerWidth;
        wHeight = $window.innerHeight;
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

            item.attr('ng-repeat', expression + ' | limitTo:lim | limitTo:n');

            return function(scope, element) {

                var cursor = 0;
                var itemHeight = 0;
                var numItems = 0;
                var firstLoad = true;

                var topItemOffset, bottomItemOffset;
                var clippingTop = false, clippingBottom = false;

                setCursor(0);

                scope.$watchCollection(rhs, function(itemArray) {
                    if(itemArray) {
                        numItems = itemArray.length;
                    }
                    if(firstLoad) {
                        updateItemHeight();
                        updateBufferVals();
                        firstLoad = false;
                    }
                    updateUI();
                });

                scrollHandler = function(bounced) {
                    if(!bounced) {
                        updateCursor();
                    }
                    updateClipping();
                };

                resizeHandler = function() {
                    updateBufferVals();
                };

                function setCursor(n) {
                    cursor = n;
                    scope.lim = numRenderedItems + n;
                    scope.n = numRenderedItems * -1;
                    updateUI();
                }

                function updateCursor() {
                    var c = Math.round(wScrollTop / itemHeight) - numBufferItems;
                    if(c < 0) c = 0;
                    var maxC = numItems - numRenderedItems;
                    if(c > maxC) c = maxC;
                    setCursor(c);
                }

                function updateClipping() {
                    clippingTop = topItemOffset > wScrollTop;
                    clippingBottom = bottomItemOffset < (wScrollTop + wHeight);
                }

                function updateUI() {
                    topItemOffset = getTopSpacerHeight();
                    bottomItemOffset = topItemOffset + (numRenderedItems * itemHeight);
                    element.css('padding-top', topItemOffset + 'px');
                    element.css('padding-bottom', getBottomSpacerHeight() + 'px');
                }

                function updateBufferVals() {
                    var numItemsOnScreen = Math.round(wHeight / itemHeight);
                    numRenderedItems = numItemsOnScreen + (numItemsOnScreen * bufferAmt);
                    numBufferItems = Math.round((numRenderedItems - numItemsOnScreen) / 2);
                    updateCursor();
                }

                function updateItemHeight() {
                    itemHeight = element.children()[0].offsetHeight;
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
