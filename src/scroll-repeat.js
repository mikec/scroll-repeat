/*
 * scrollRepeat directive
 *
 * //
 *
 */

angular.module('litl', []).directive('scrollRepeat', ['$window', '$timeout',
function($window, $timeout) {

    var bufferAmt = 30;
    var numAllowedItems = 1;
    var numBufferItems;

    var w = angular.element($window);
    var body = angular.element($window.document.body);

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

            item.attr('ng-repeat', expression + ' | limitTo:ofs | limitTo:lim');

            return function(scope, element) {

                var cursor = 0;
                var itemHeight = 0;
                var numItems = 0;

                var topItemOffset, bottomItemOffset;
                var clippingTop = false, clippingBottom = false;

                setCursor(0);

                scope.$watchCollection(rhs, function(itemArray) {
                    if(itemArray) {
                        numItems = itemArray.length;
                    }
                    $timeout(function() {
                        updateItemHeight();
                        updateBufferVals();
                        updateBodyHeight();
                    });
                });

                scrollHandler = function(bounced) {
                    if(!bounced) {
                        updateCursor();
                    }
                    updateClipping();
                };

                resizeHandler = function() {
                    updateItemHeight();
                    updateBufferVals();
                };

                function setCursor(n) {
                    cursor = n;
                    var ofsBase = numAllowedItems < numItems ?
                                    numAllowedItems : numItems;
                    var ofs = ofsBase + n;
                    var lim = ofsBase * -1;
                    if(ofs === 0) ofs = 1;
                    if(lim === 0) lim = -1;
                    scope.ofs = ofs;
                    scope.lim = lim;
                    updateOffset();
                }

                function updateCursor() {
                    var c = itemHeight > 0 ?
                                Math.round(wScrollTop / itemHeight) - numBufferItems : 0;
                    if(c < 0) c = 0;
                    var maxC = numItems - numAllowedItems;
                    if(maxC < 0) maxC = 0;
                    if(c > maxC) c = maxC;
                    setCursor(c);
                }

                function updateClipping() {
                    clippingTop = topItemOffset > wScrollTop;
                    clippingBottom = bottomItemOffset < (wScrollTop + wHeight);
                }

                function updateBodyHeight() {
                    body.css('height', (numItems * itemHeight) + 'px');
                }

                function updateOffset() {
                    topItemOffset = getTopSpacerHeight();
                    bottomItemOffset = topItemOffset + (numAllowedItems * itemHeight);
                    setTranslateY(topItemOffset);
                }

                function updateBufferVals() {
                    var numItemsOnScreen =
                            itemHeight > 0 ?
                                Math.round(wHeight / itemHeight) : 0;
                    numAllowedItems = numItemsOnScreen + (numItemsOnScreen * bufferAmt);
                    numBufferItems = Math.round((numAllowedItems - numItemsOnScreen) / 2);
                    updateCursor();
                }

                function updateItemHeight() {
                    var firstItem = element.children()[0];
                    itemHeight = firstItem ? firstItem.offsetHeight : 0;
                }

                function getTopSpacerHeight() {
                    return cursor * itemHeight;
                }

                function setTranslateY(amt) {
                    var t = 'translateY(' + amt + 'px)';
                    element.css('transform', t);
                    element.css('webkitTransform', t);
                    element.css('mozTransform', t);
                }

            };
        }
    };
}]);
