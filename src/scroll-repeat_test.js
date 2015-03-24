
var scrollDebounceTime = 500;   // debounced scroll timeout
var phChunkSize = 250;          // number of items in a placeholder
var phChunksAfter500ms = 2;     // number of placeholder chunks created in 500ms

describe('scrollRepeat', function() {

    beforeEach(function() {

        module('litl', function($provide) {
            $provide.value('$window', mockWindow);
        });

        inject(function($rootScope, $compile, $window, $timeout) {
            this.$rootScope = $rootScope;
            this.scope = $rootScope.$new();
            this.$compile = $compile;
            this.$window = $window;
            this.$timeout = $timeout;
            this.body = $j(window.document.body);
            this.body.css('padding', 0);
            this.body.css('margin', 0);
        });

    });

    afterEach(inject(function($document) {
        $document.find('body').html('');
        this.$window.document.body.scrollTop = 0;
        $j(this.element).remove();
    }));

    // assuming bufferAmt = 30;

    describe('with 10 items on screen', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.$window.innerWidth = 100;
            bodyHeightSpy();
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getTmpl(10))(this.scope);
            this.body.append(this.element);
            this.$rootScope.$digest();
            this.$timeout.flush();
        });

        // numItemsOnScreen = 100 / 10 = 10
        // numAllowedItems = 10 + (10 * 30) = 310

        it('should set ng-repeat limit to -310', function() {
            expect(this.scope.lim).toBe(-310);
        });

        it('should set ng-repeat offset to 310', function() {
            expect(this.scope.ofs).toBe(310);
        });

        it('should set top offset to 0', function() {
            expectTopOffset.call(this).toBe(0);
        });

        it('should set body height to 50000', function() {
            // 5000 * 10
            expectBodyHeight().toBe('50000px');
        });

        describe('after scrolling down past the buffer', function() {

            beforeEach(function() {
                // compensate for placeholder top buffer
                var scrollAmt = 1510 + (phChunkSize * phChunksAfter500ms * 10);
                scrollWindowTo.call(this, scrollAmt);
                this.$timeout.flush(scrollDebounceTime);
            });

            it('should set ng-repeat offset to 811 ', function() {
                expect(this.scope.ofs).toBe(811);
            });

            it('should set top offset to 10', function() {
                expectTopOffset.call(this).toBe(10);
            });

        });

        describe('when window is resized resulting in item height change', function() {

            beforeEach(function() {
                $j('.scroll-repeat-item-content').height(20);
                resizeWindow.call(this, 150, 150);
            });

            // numItemsOnScreen = 150 / 20 = 8
            // numAllowedItems = 8 + (8 * 30) = 248

            it('should set ng-repeat limit to -248', function() {
                expect(this.scope.lim).toBe(-248);
            });

            it('should set ng-repeat offset to 248', function() {
                expect(this.scope.ofs).toBe(248);
            });

            it('should set top offset to 0', function() {
                expectTopOffset.call(this).toBe(0);
            });

        });

    });

    describe('when the root element is offset from the top', function() {

        beforeEach(function() {
            this.body.css('margin-top', '200px');
            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getTmpl(10))(this.scope);
            this.body.append(this.element);
            this.$rootScope.$digest();
            this.$timeout.flush();
            // scrolling an extra 200px
            // compensate for placeholder top buffer
            var scrollAmt = 1510 + 200 + (phChunkSize * phChunksAfter500ms * 10);
            scrollWindowTo.call(this, scrollAmt);
            this.$timeout.flush(scrollDebounceTime);
        });

        it('should set ng-repeat offset to 811 ', function() {
            expect(this.scope.ofs).toBe(811);
        });

        it('should set top offset to 10', function() {
            expectTopOffset.call(this).toBe(10);
        });

    });

    describe('when number of items is less than allowed number ' +
                'of rendered items', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(3);
            this.element = this.$compile(getTmpl(10))(this.scope);
            this.body.append(this.element);
            bodyHeightSpy();
            this.$rootScope.$digest();
            this.$timeout.flush();
        });

        it('should set ng-repeat limit to -3', function() {
            expect(this.scope.lim).toBe(-3);
        });

        it('should set ng-repeat offset to 3', function() {
            expect(this.scope.ofs).toBe(3);
        });

        it('should set top offset to 0', function() {
            expectTopOffset.call(this).toBe(0);
        });

        it('should set body height to 30', function() {
            // 3 * 10
            expectBodyHeight().toBe('30px');
        });

    });

    describe('when initial number of items is 0', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.scope.items = [];
            this.element = this.$compile(getTmpl(10))(this.scope);
            this.body.append(this.element);
            this.$rootScope.$digest();
            this.$timeout.flush();
        });

        it('should set ng-repeat limit to the buffer amount * -1', function() {
            expect(this.scope.lim).toBe(-30);
        });

        it('should set ng-repeat offset to the buffer amount', function() {
            expect(this.scope.ofs).toBe(30);
        });

        it('should set top offset to 0', function() {
            expectTopOffset.call(this).toBe(0);
        });

        describe('and items are added to the bound array', function() {

            beforeEach(function() {
                this.scope.items.push({});
                this.scope.items.push({});
                this.scope.items.push({});
                this.$rootScope.$digest();
                this.$timeout.flush();
            });

            it('should set ng-repeat limit to -3', function() {
                expect(this.scope.lim).toBe(-3);
            });

            it('should set ng-repeat offset to 3', function() {
                expect(this.scope.ofs).toBe(3);
            });

            it('should set top offset to 0', function() {
                expectTopOffset.call(this).toBe(0);
            });

        });

    });


    describe('with 4 items on screen and 2 items to a row', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.$window.innerWidth = 100;
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getTmpl(50, 50))(this.scope);
            this.body.width(100);
            this.body.append(this.element);
            bodyHeightSpy();
            this.$rootScope.$digest();
            $j('.scroll-repeat-item').css('float', 'left');
            this.$timeout.flush();
        });

        it('should set body height to 125000', function() {
            // 100 / 50 = 2
            // (5000 / 2) * 50 = 125000
            expectBodyHeight().toBe('125000px');
        });

        it('should set ng-repeat offset to 620 ', function() {
            // bufferAmt = 30
            // numItemsOnScreen = 4
            // numAllowedItems = 4 + (4 * 30) = 124
            expect(this.scope.ofs).toBe(124);
        });

        it('should set top offset to 0', function() {
            expectTopOffset.call(this).toBe(0);
        });

        describe('when window is resized, and there are 3 items in a row',
        function() {

            beforeEach(function() {
                resizeWindow.call(this, 150);
            });

            it('should set body height to 83350', function() {
                // 150 / 50 = 3
                // (5001 / 3) * 50 = 83350
                expectBodyHeight(1).toBe('83350px');
            });

        });

        describe('after scrolling down past the buffer', function() {

            beforeEach(function() {
                var scrollAmt = 1550 + (phChunkSize * phChunksAfter500ms * (50 / 2));
                scrollWindowTo.call(this, scrollAmt);
                this.$timeout.flush(scrollDebounceTime);
            });

            it('should set ng-repeat offset to 626 ', function() {
                expect(this.scope.ofs).toBe(626);
            });

            it('should set top offset to 50', function() {
                // cursor = 2
                // numColumns = 2
                // offset top =
                //      cursor / numColumns * itemHeight =
                //      2 / 2 * 50 = 50
                expectTopOffset.call(this).toBe(50);
            });

            /*TODO: this test isn't working because all placeholder top
                    elements have an offsetTop of 0. Might be easier
                    to build an e2e test for this.

            describe('and resizing while scrolled down', function() {

                beforeEach(function() {
                    resizeWindow.call(this, 150);
                });

                it('should set body height to 83350', function() {
                    // 150 / 50 = 3
                    // (5001 / 3) * 50 = 83350
                    expectBodyHeight(1).toBe('83350px');
                });

            });*/

        });

    });

    describe('with a large number of columns', function() {

        beforeEach(function() {
            this.winWidth = 70;
            this.itemWidth = 10;
            this.numItems = 5000;
            this.numCols = this.winWidth / this.itemWidth; // 7
            this.numRows = Math.ceil(this.numItems / this.numCols);
            this.$window.innerHeight = this.winWidth;
            this.$window.innerWidth = this.winWidth;
            this.scope.items = getMockItems(this.numItems);
            this.element =
                    this.$compile(getTmpl(this.itemWidth, this.itemWidth))(this.scope);
            this.body.width(this.winWidth);
            this.body.append(this.element);
            this.$rootScope.$digest();
            $j('.scroll-repeat-item').css('float', 'left');
            this.$timeout.flush();
        });

        describe('when scrolling to the middle of the set', function() {

            beforeEach(function() {
                scrollWindowTo.call(this, 1550);
                this.$timeout.flush(scrollDebounceTime);
            });

            it('should set ng-repeat limit to a multiple of the number of columns',
            function() {
                // lim = -500 adjusted to -497
                var mod = this.scope.lim % this.numCols;
                expect(mod).toBe(0);
            });

            it('should set ng-repeat offset to a multiple of the number of columns',
            function() {
                // would be 1359, adjusted to 1358
                var mod = this.scope.ofs % this.numCols;
                expect(mod).toBe(0);
            });

        });

        describe('when scrolling past the bottom of the set', function() {

            beforeEach(function() {
                scrollWindowTo.call(this, 10000);
                this.$timeout.flush(scrollDebounceTime);
            });

            it('should adjust offset to stop at the last item',
            function() {
                expect(this.scope.ofs).toBe(this.numRows * this.numCols);
            });

            it('should adjust limit to stop at the last item',
            function() {
                var newLim = -497 + (this.numCols - (this.numItems % this.numCols));
                expect(this.scope.lim).toBe(newLim);
            });

        });

    });

    describe('when max allowed items is exceeded', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.$window.innerWidth = 100;
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getTmpl(10, 50))(this.scope);
            this.body.width(100);
            this.body.append(this.element);
            this.$rootScope.$digest();
            $j('.scroll-repeat-item').css('float', 'left');
            this.$timeout.flush();
            scrollWindowTo.call(this, 1210);
            this.$timeout.flush(scrollDebounceTime);
        });

        it('buffer should not exceed the max', function() {
            // numAllowedItems = 500
            // numItemsOnScreen = 20
            // numBufferedItems = (500 - 20) / 2 = 240
            // offset base = numAllowedItems = 500
            // item offset = round(1210 / 10) = 121
            // cursor = 121 * 2 - 240 = 2
            // offset = 500 + 2 = 502
            expect(this.scope.ofs).toBe(502);
        });

    });

    describe('with a small set of data', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.$window.innerWidth = 100;
            this.scope.items = getMockItems(5);
            this.element = this.$compile(getTmpl(10, 50))(this.scope);
            this.body.width(100);
            this.body.append(this.element);
            this.$rootScope.$digest();
            $j('.scroll-repeat-item').css('float', 'left');
            this.$timeout.flush();
        });

        it('should not create placeholder items', function() {
            this.expectNumberOfPlaceholders('top').toBe(0);
            this.expectNumberOfPlaceholders('bottom').toBe(0);
        });

        it('should set offset and limit to show all items', function() {
            expect(this.scope.ofs).toBe(5);
            expect(this.scope.lim).toBe(-5);
        });

    });

    describe('placeholder items', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.$window.innerWidth = 100;
            this.itemWidth = 20;
            this.numCols = this.$window.innerWidth / 20; // 5
            this.numItems = 998;
            this.scope.items = getMockItems(this.numItems);
            this.element = this.$compile(getTmpl(this.itemWidth,
                                                    this.itemWidth))(this.scope);
            this.body.append(this.element);
            this.$rootScope.$digest();
            $j('.scroll-repeat-item').css('float', 'left');
            this.$timeout.flush();
        });

        it('should create the first top placeholder chunk', function() {
            this.expectNumberOfPlaceholders('top').toBe(phChunkSize);
        });

        it('should create the first bottom placeholder chunk', function() {
            this.expectNumberOfPlaceholders('bottom').toBe(phChunkSize);
        });

        it('should hide all top placeholders', function() {
            this.expectNumberOfVisiblePlaceholders('top').toBe(0);
        });

        /* TODO: needs fix... */
        /* TEMPORARY SPEC */
        it('should show all bottom placeholders', function() {
            this.expectNumberOfVisiblePlaceholders('bottom').toBe(phChunkSize);
        });
        /* ACTUAL SPEC
        it('should show bottom placeholders with an exact number in the bottom row',
        function() {
            var n = phChunkSize;
            var m = (this.numItems % this.numCols);
            if(m > 0) n -= m;
            this.expectNumberOfVisiblePlaceholders('bottom').toBe(n);
        });*/

        describe('scrolling to bottom', function() {

            beforeEach(function() {
                scrollWindowTo.call(this, 30000);
                this.$timeout.flush(scrollDebounceTime);
            });

            it('should show all top placeholders', function() {
                this.expectNumberOfVisiblePlaceholders('top').toBe(phChunkSize * phChunksAfter500ms);
            });

            it('should hide all bottom placeholders', function() {
                this.expectNumberOfVisiblePlaceholders('bottom').toBe(0);
            });

        });

    });

    describe('when number of items is a multiple of the number of columns and ' +
                'scrolled to the bottom of the set',
    function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.$window.innerWidth = 100;
            this.itemWidth = 20;
            this.numCols = this.$window.innerWidth / 20; // 5
            this.numItems = 1000;
            this.scope.items = getMockItems(this.numItems);
            this.element = this.$compile(getTmpl(this.itemWidth,
                                                    this.itemWidth))(this.scope);
            this.body.width(100);
            this.body.append(this.element);
            this.$rootScope.$digest();
            $j('.scroll-repeat-item').css('float', 'left');
            this.$timeout.flush();
            scrollWindowTo.call(this, 30000);
            this.$timeout.flush(scrollDebounceTime);
        });

        it('should hide all bottom placeholders', function() {
            this.expectNumberOfVisiblePlaceholders('bottom').toBe(0);
        });

    });

    describe('when placeholder template is defined with text nodes', function() {

        beforeEach(function() {
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getPlaceholderTmpl('text'))(this.scope);
            this.$rootScope.$digest();
            this.$timeout.flush();
        });

        it('should append text node template to placeholders', function() {
            var phElems = this.getPlaceholders('top');
            expect($j(phElems[0].children()[0]).html()).toBe('PLACEHOLDER');
        });

        it('should append text node template to items', function() {
            var itmElems = this.getItemElements();
            expect($j($j(itmElems[0]).children()[0]).html()).toBe('ITEM');
        });

    });

    describe('when placeholder template is defined with html', function() {

        beforeEach(function() {
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getPlaceholderTmpl('html'))(this.scope);
            this.$rootScope.$digest();
            this.$timeout.flush();
        });

        it('should append text node template to placeholders', function() {
            var phElems = this.getPlaceholders('top');
            expect($j(phElems[0].children()[0]).html()).toBe('<div>PLACEHOLDER</div>');
        });

        it('should append text node template to items', function() {
            var itmElems = this.getItemElements();
            expect($j($j(itmElems[0]).children()[0]).html()).toBe('<div>ITEM</div>');
        });

    });

    // TODO: fix clipping with placeholders

    /*describe('when top and bottom clipping occurs', function() {

        beforeEach(function() {
            var $this = this;
            this.clipWatcherBottom = false;
            this.clipWatcherTop = false;
            this.scope.$watch('scrollRepeatClippingBottom', function(v) {
                if(!$this.clipWatcherBottom) {
                    $this.clipWatcherBottom = v;
                }
            });
            this.scope.$watch('scrollRepeatClippingTop', function(v) {
                if(!$this.clipWatcherTop) {
                    $this.clipWatcherTop = v;
                }
            });

            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getTmpl(10))(this.scope);
            this.body.width(100);
            this.body.append(this.element);
            this.$rootScope.$digest();
            this.$timeout.flush();
            scrollWindowTo.call(this, 8000);
            this.$timeout.flush(scrollDebounceTime);
            scrollWindowTo.call(this, 0);
        });

        it('should set scrollRepeatClippingBottom to true', function() {
            expect(this.clipWatcherBottom).toEqual(true);
        });

        it('should set scrollRepeatClippingTop to true', function() {
            expect(this.clipWatcherTop).toEqual(true);
        });

        it('should update cursor', function() {
            expect(this.scope.ofs).toBe(960);
        });

        describe('and scrolling continues', function() {

            beforeEach(function() {
                scrollWindowTo.call(this, 7000);
                this.$timeout.flush(100);
                scrollWindowTo.call(this, 6000);
                this.$timeout.flush(100);
                scrollWindowTo.call(this, 5000);
                this.$timeout.flush(100);
                scrollWindowTo.call(this, 4000);
                this.$timeout.flush(100);
                scrollWindowTo.call(this, 3000);
                this.$timeout.flush(100);
                scrollWindowTo.call(this, 2000);
                this.$timeout.flush(100);
            });

            it('should wait to update cursor until scroll ends', function() {
                expect(this.scope.ofs).toBe(960);
            });

        });

    });

    describe('when top and bottom clipping occurs on a multi column layout', function() {

        beforeEach(function() {
            var $this = this;
            this.clipWatcherBottom = false;
            this.clipWatcherTop = false;
            this.scope.$watch('scrollRepeatClippingBottom', function(v) {
                if(!$this.clipWatcherBottom) {
                    $this.clipWatcherBottom = v;
                }
            });
            this.scope.$watch('scrollRepeatClippingTop', function(v) {
                if(!$this.clipWatcherTop) {
                    $this.clipWatcherTop = v;
                }
            });

            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getTmpl(50, 50))(this.scope);
            this.body.width(100);
            this.body.append(this.element);
            this.$rootScope.$digest();
            $j('.scroll-repeat-item').css('float', 'left');
            this.$timeout.flush();
            scrollWindowTo.call(this, 3010);
            this.$timeout.flush(scrollDebounceTime);
            scrollWindowTo.call(this, 0);
        });

        it('should set scrollRepeatClippingBottom to true', function() {
            expect(this.clipWatcherBottom).toEqual(true);
        });

        it('should set scrollRepeatClippingTop to true', function() {
            expect(this.clipWatcherTop).toEqual(true);
        });

    });*/

    beforeEach(function() {

        var $this = this;

        // helper functions
        this.expectNumberOfPlaceholders = function(topOrBottom) {
            return expect($this.getPlaceholders(topOrBottom).length);
        };

        this.expectNumberOfVisiblePlaceholders = function(topOrBottom) {
            var elems = $this.getPlaceholders(topOrBottom);
            var n = 0;
            for(var i in elems) {
                var e = elems[i];
                if(e.css('display') !== 'none') {
                    n++;
                }
            }
            return expect(n);
        };

        this.getPlaceholders = function(topOrBottom) {
            var placeholders = [];
            var foundBoundElems = false;
            $j(this.element).children().each(function() {
                var e = $j(this);
                if(e.hasClass('scroll-repeat-item-placeholder')) {
                    if(topOrBottom == 'top' && !foundBoundElems) {
                        placeholders.push(e);
                    } else if (topOrBottom == 'bottom' && foundBoundElems) {
                        placeholders.push(e);
                    }
                } else {
                    foundBoundElems = true;
                }
            });
            return placeholders;
        };

        this.getItemElements = function() {
            return $j(this.element)
                        .find('.scroll-repeat-item')
                        .not('.scroll-repeat-item-placeholder');
        };

    });

    function expectTopOffset() {
        var t = this.element.css('transform');
        var transY = parseInt((new WebKitCSSMatrix(t)).m42);
        return expect(transY);
    }

    function expectBodyHeight(callIndex) {
        if(!callIndex) callIndex = 0;
        return expect(mockBodyElem.css.calls.argsFor(callIndex)[1]);
    }

    function scrollWindowTo(scrollTop) {
        this.$window.document.body.scrollTop = scrollTop;
        mockWindowElem.boundEvents['scroll']();
    };

    function resizeWindow(width, height) {
        if(width > 0) {
            this.$window.innerWidth = width;
            this.body.width(width);
        }
        if(height > 0) {
            this.$window.innerHeight = height;
            this.body.height(height);
        }
        mockWindowElem.boundEvents['resize']();
    }

    function bodyHeightSpy() {
        spyOn(mockBodyElem, 'css');
    }

    function getTmpl(itmHeight, itmWidth) {
        var e = $j('<div scroll-repeat="itm in items"></div>');
        var innerElem = $j('<div></div>');
        innerElem.height(itmHeight);
        if(itmWidth > 0) {
            innerElem.width(itmWidth);
        }
        e.append(innerElem);
        return e;
    }

    function getPlaceholderTmpl(type) {
        var tmpls = {
            'text':     '<div scroll-repeat="itm in items">' +
                            '<div scroll-repeat-item>ITEM</div>' +
                            '<div scroll-repeat-placeholder>PLACEHOLDER</div>' +
                        '</div>',
            'html':     '<div scroll-repeat="itm in items">' +
                            '<div scroll-repeat-item><div>ITEM</div></div>' +
                            '<div scroll-repeat-placeholder><div>PLACEHOLDER</div></div>' +
                        '</div>',
        };
        return tmpls[type];
    }

    function getMockItems(n) {
        var arr = [];
        for(var i = 0; i < n; i++) {
            arr.push({});
        }
        return arr;
    }

});
