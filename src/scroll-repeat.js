/*
 * scroll-repeat
 * (https://github.com/mikec/scroll-repeat)
 *
 * Angular directive for scrolling through a large number of items
 *
 */

angular.module('litl', []).directive('scrollRepeat', ['$window', '$timeout',
function($window, $timeout) {

    var bufferAmt = 30;
    var maxAllowedItems = 500;
    var numAllowedItems = bufferAmt; // allowed on first load
    var numColumns = 1;
    var numBufferItems;

    var w = angular.element($window);
    var body = angular.element($window.document.body);

    var wHeight, wWidth;
    var resizeDebounce;
    var resizeDebounceTime = 500;
    var resizeHandler;

    var wScrollTop = 0;
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
                var baseOffsetPx = 0;

                var topItemOffset, bottomItemOffset;

                scope.scrollRepeatClippingTop = false;
                scope.scrollRepeatClippingBottom = false;

                setCursor(0);

                scope.$watchCollection(rhs, function(itemArray) {
                    if(itemArray) {
                        numItems = itemArray.length;
                    }
                    $timeout(function() {
                        updateItemRendering();
                    });
                });

                scrollHandler = function(bounced) {
                    if(!bounced) {
                        updateCursor();
                    }
                    updateClipping();
                };

                resizeHandler = function() {
                    updateItemRendering();
                };

                function setCursor(n) {
                    cursor = n;
                    var ofsBase = numAllowedItems < numItems ?
                                    numAllowedItems : numItems;
                    var ofs = ofsBase + n;
                    var lim = ofsBase * -1;
                    if(ofs === 0) ofs = numAllowedItems;
                    if(lim === 0) lim = numAllowedItems * -1;
                    scope.ofs = ofs;
                    scope.lim = lim;
                    updateOffset();
                }

                function updateCursor() {
                    var c = 0;
                    if(itemHeight > 0) {
                        var adjustedScrollTop = wScrollTop - baseOffsetPx;
                        if(adjustedScrollTop < 0) adjustedScrollTop = 0;
                        c = (Math.round(adjustedScrollTop / itemHeight) * numColumns) - numBufferItems;
                        if(c < 0) c = 0;
                    }
                    var maxC = numItems - numAllowedItems;
                    if(maxC < 0) maxC = 0;
                    if(c > maxC) c = maxC;
                    setCursor(c);
                }

                function updateClipping() {
                    var newClippingTop = topItemOffset > wScrollTop;
                    var newClippingBottom = bottomItemOffset < (wScrollTop + wHeight);

                    if(scope.scrollRepeatClippingTop !== newClippingTop) {
                        scope.$apply(function() {
                            scope.scrollRepeatClippingTop = newClippingTop;
                        });
                    }

                    if(scope.scrollRepeatClippingBottom !== newClippingBottom) {
                        scope.$apply(function() {
                            scope.scrollRepeatClippingBottom = newClippingBottom;
                        });
                    }
                }

                function updateBodyHeight() {
                    body.css('height', ((numItems / numColumns) * itemHeight) + 'px');
                }

                function updateOffset() {
                    topItemOffset = getTopSpacerHeight();
                    var numRows = Math.ceil(numAllowedItems / numColumns);
                    bottomItemOffset = topItemOffset + (numRows * itemHeight);
                    setTranslateY(topItemOffset);
                }

                function updateItemRendering() {
                    itemHeight = getItemHeight();
                    numColumns = getNumColumns();
                    baseOffsetPx = getBaseOffsetPx();

                    if(itemHeight === 0) {
                        numAllowedItems = bufferAmt;
                        numBufferItems = 0;
                    } else {
                        var numItemsOnScreen = Math.round(wHeight / (itemHeight / numColumns));
                        numAllowedItems = numItemsOnScreen + (numItemsOnScreen * bufferAmt);
                        if(numAllowedItems > maxAllowedItems) numAllowedItems = maxAllowedItems;
                        numBufferItems = Math.round((numAllowedItems - numItemsOnScreen) / 2);
                    }
                    updateCursor();
                    updateBodyHeight();
                }

                function getNumColumns() {
                    var n = 1;
                    var itmElems = element.children();
                    var iOfs;
                    for(var i in itmElems) {
                        var e = itmElems[i];
                        if(!e) break;
                        else {
                            var ofs = e.offsetTop;
                            if(ofs >= 0) {
                                if(angular.isUndefined(iOfs)) {
                                    iOfs = ofs;
                                }
                                if(ofs == iOfs) {
                                    n = parseInt(i) + 1;
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                    return n;
                }

                function getBaseOffsetPx() {
                    return element[0].offsetTop;
                }

                function getItemHeight() {
                    var firstItem = angular.element(element.children()[0]);
                    if(firstItem) {
                        var firstItemContent = firstItem.children()[0];
                        if(firstItemContent) {
                            return firstItemContent.offsetHeight;
                        }
                    }
                    return 0;
                }

                function getTopSpacerHeight() {
                    return Math.floor(cursor / numColumns) * itemHeight;
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
