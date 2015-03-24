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

    var phCreationChunkSize = 250;
    var phCreationInterval = 200;
    var phMaxAllowed = 5000;

    var w = angular.element($window);
    var body = angular.element($window.document.body);

    var wHeight, wWidth;
    var resizeDebounce;
    var resizeDebounceTime = 500;
    var resizeHandler;

    var wScrollTop = 0;
    var scrollDebounce;
    var scrollDebounceTime = 500;
    var scrollEnd;
    var scrollEndTime = 200;
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
                if(scrollHandler) scrollHandler('debounced');
                scrollDebounce = undefined;
            }, scrollDebounceTime);
        }
        $timeout.cancel(scrollEnd);
        scrollEnd = $timeout(function() {
            scrollHandler('ended');
        }, scrollEndTime);
        if(scrollHandler) scrollHandler();
    });

    function updateWindowSizes() {
        var wChanged = $window.innerWidth !== wWidth;
        var hChanged = $window.innerHeight !== wHeight;
        wWidth = $window.innerWidth;
        wHeight = $window.innerHeight;
        resizeDebounce = undefined;
        if(resizeHandler) {
            resizeHandler({
                widthChanged: wChanged,
                heightChanged: hChanged
            });
        }
    }

    return {
        compile: function(tElement, tAttrs) {
            var itemTmpl = '<div class="scroll-repeat-item"></div>';
            var phTmpl = '<div class="scroll-repeat-item scroll-repeat-item-placeholder"></div>';
            var contentTmpl = '<div class="scroll-repeat-item-content"></div>';
            var expression = tAttrs.scrollRepeat;

            var item = angular.element(itemTmpl);
            var content = angular.element(contentTmpl);
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
                var numRows = 0;
                var baseOffsetPx = 0;
                var baseOffsetAmt = 0;
                var bodyHeight = 0;

                var topItemOffset, bottomItemOffset;

                var phCreateStarted = false;
                var phElementsTop = [];
                var phElementsBottom = [];
                var phDisplayVal;
                var phHiddenTop = 0;
                var phHiddenBottom = 0;
                var phTopHeight = 0;

                scope.scrollRepeatClippingTop = false;
                scope.scrollRepeatClippingBottom = false;

                updateCursor();

                scope.$watchCollection(rhs, function(itemArray) {
                    if(itemArray) {
                        numItems = itemArray.length;
                    }
                    $timeout(function() {
                        recalcUI();
                        if(numItems > 0 &&
                            !phCreateStarted &&
                            numItems > numAllowedItems)
                        {
                            createPlaceholders();
                        }
                    });
                });

                scrollHandler = function(scrollState) {
                    if(scrollState == 'debounced' &&
                        !scope.scrollRepeatClippingTop &&
                        !scope.scrollRepeatClippingBottom)
                    {
                        updateCursor();
                    } else if (scrollState == 'ended') {
                        updateCursor();
                    }
                    updateClipping();
                };

                resizeHandler = function(event) {
                    if(event.widthChanged) {
                        recalcUI();
                    }
                };

                function updatePlaceholderDisplays() {
                    var numTopElems = phElementsTop.length;
                    var mod = numTopElems % numColumns;
                    var numHiddenTop = numTopElems - cursor;
                    if(numHiddenTop < mod) numHiddenTop = mod;
                    var topDiff = numHiddenTop - phHiddenTop;
                    if(topDiff !== 0) {
                        updatePhElementDisplay(phElementsTop,
                                phHiddenTop, topDiff, phDisplayVal);
                        phHiddenTop = numHiddenTop;
                    }
                    phTopHeight =
                        ((numTopElems - numHiddenTop) / numColumns) * itemHeight;

                    var extraPh = numColumns - (numItems % numColumns);
                    var bottomPhRows = numRows - (scope.ofs / numColumns);
                    var numVisiblebottom = (bottomPhRows * numColumns) + extraPh;
                    var numHiddenBottom = phElementsBottom.length - numVisiblebottom;
                    if(numHiddenBottom < 0) numHiddenBottom = 0;
                    if(numHiddenBottom > phElementsBottom.length) {
                        numHiddenBottom = phElementsBottom.length;
                    }
                    var bottomDiff = numHiddenBottom - phHiddenBottom;
                    if(bottomDiff !== 0) {
                        updatePhElementDisplay(phElementsBottom,
                                phHiddenBottom, bottomDiff, phDisplayVal, true);
                        phHiddenBottom = numHiddenBottom;
                    }
                }

                function updatePhElementDisplay(elements, prev, diff, displayVal, TST) {
                    if(diff > 0) {
                        for(var i = prev; i < prev + diff; i++) {
                            elements[i].css('display', 'none');
                        }
                    } else if(diff < 0) {
                        for(var j = prev - 1; j >= prev + diff; j--) {
                            elements[j].css('display', displayVal);
                        }
                    }
                }

                function createPlaceholders() {
                    phCreateStarted = true;
                    for(var i=0; i < phCreationChunkSize; i++) {
                        var phElemTop = createPlaceholder();
                        phElementsTop.push(phElemTop);
                        element.prepend(phElemTop);
                    }
                    for(var j=0; j < phCreationChunkSize; j++) {
                        var phElemBottom = createPlaceholder();
                        phElementsBottom.push(phElemBottom);
                        element.append(phElemBottom);
                    }
                    if(angular.isUndefined(phDisplayVal)) {
                        phDisplayVal = phElementsTop[0].css('display');
                    }

                    updateOffset();

                    if(phElementsTop.length < phMaxAllowed) {
                        $timeout(createPlaceholders, phCreationInterval);
                    }
                }

                function updateOffset() {
                    updatePlaceholderDisplays();
                    topItemOffset = Math.floor(cursor / numColumns) * itemHeight - phTopHeight;
                    var numRows = Math.ceil(numAllowedItems / numColumns);
                    bottomItemOffset = topItemOffset + (numRows * itemHeight);
                    setTranslateY(topItemOffset);
                }

                function setCursor(n) {
                    cursor = n;

                    if(numItems > 0) {
                        var ofs = baseOffsetAmt + n;
                        var lim = baseOffsetAmt;
                        if(cursor + lim > numItems) {
                            var dif = cursor + lim - numItems;
                            lim -= dif;
                        }
                        scope.ofs = ofs;
                        scope.lim = lim * -1;
                    } else {
                        scope.ofs = numAllowedItems;
                        scope.lim = numAllowedItems * -1;
                    }

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

                    var m = numItems % numColumns;
                    var maxC = (numRows * numColumns) - baseOffsetAmt;
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
                    bodyHeight = numRows * itemHeight;
                    body.css('height', bodyHeight + 'px');
                }

                function recalcUI() {
                    setCalcProps();

                    if(itemHeight === 0) {
                        numAllowedItems = bufferAmt;
                        numBufferItems = 0;
                    } else {
                        var numItemsOnScreen = Math.round(wHeight / (itemHeight / numColumns));
                        numAllowedItems = numItemsOnScreen + (numItemsOnScreen * bufferAmt);
                        if(numAllowedItems > maxAllowedItems) numAllowedItems = maxAllowedItems;
                        numBufferItems = Math.round((numAllowedItems - numItemsOnScreen) / 2);
                        numBufferItems = numBufferItems - (numBufferItems % numColumns);
                    }

                    var m = numItems % numColumns;
                    numRows = (m === 0 ? numItems : numItems + (numColumns - m)) / numColumns;

                    if(numItems < numAllowedItems) {
                        baseOffsetAmt = numItems;
                    } else {
                        baseOffsetAmt = numAllowedItems - (numAllowedItems % numColumns);
                    }

                    updateCursor();
                    updateBodyHeight();
                }

                function setCalcProps() {
                    itemHeight = getItemHeight();
                    numColumns = getNumColumns();
                    baseOffsetPx = getBaseOffsetPx();
                }

                function getNumColumns() {
                    var n = 1;
                    var itmElems = element.children();
                    var iOfs;
                    var colCount = 0;
                    var firstVisible = phHiddenTop;
                    var lastVisible = phHiddenTop + numItems;
                    for(var i = firstVisible; i <= lastVisible; i++) {
                        var outerElem = itmElems[i];
                        if(!outerElem || typeof outerElem !== 'object') break;
                        else {
                            var ofs = getCalculatedProperty(outerElem, 'offsetTop');
                            if(ofs >= 0) {
                                if(angular.isUndefined(iOfs)) {
                                    iOfs = ofs;
                                }
                                if(ofs == iOfs) {
                                    n = colCount + 1;
                                } else {
                                    break;
                                }
                                colCount++;
                            }
                        }
                    }
                    return n;
                }

                function getBaseOffsetPx() {
                    return element[0].offsetTop;
                }

                function getItemHeight() {
                    return getCalculatedProperty(
                            element.children()[phElementsTop.length], 'offsetHeight');
                }

                function getCalculatedProperty(outerElem, prop) {
                    var p = 0;
                    if(outerElem && typeof outerElem == 'object') {
                        var outerVal = outerElem[prop];
                        var innerElem = angular.element(outerElem).children()[0];
                        if(innerElem && typeof innerElem == 'object') {
                            var innerVal = innerElem[prop];
                            p = outerVal > innerVal ? outerVal : innerVal;
                        }
                    }
                    return p;
                }

                function setTranslateY(amt) {
                    var t = 'translateY(' + amt + 'px)';
                    element.css('transform', t);
                    element.css('webkitTransform', t);
                    element.css('mozTransform', t);
                }

                function createPlaceholder() {
                    var itm = angular.element(phTmpl);
                    itm.append(angular.element(contentTmpl));
                    return itm;
                }

            };
        }
    };
}]);
