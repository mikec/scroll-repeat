
var scrollDebounceTime = 500;
var placeholderChunkAmount = 100;

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
                var scrollAmt = 1510 + (placeholderChunkAmount * 10);
                scrollWindowTo.call(this, scrollAmt);
                this.$timeout.flush(scrollDebounceTime);
            });

            it('should set ng-repeat offset to 411 ', function() {
                expect(this.scope.ofs).toBe(411);
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
            var scrollAmt = 1510 + 200 + (placeholderChunkAmount * 10);
            scrollWindowTo.call(this, scrollAmt);
            this.$timeout.flush(scrollDebounceTime);
        });

        it('should set ng-repeat offset to 411 ', function() {
            expect(this.scope.ofs).toBe(411);
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
                var scrollAmt = 1550 + (placeholderChunkAmount * (50 / 2));
                scrollWindowTo.call(this, scrollAmt);
                this.$timeout.flush(scrollDebounceTime);
            });

            it('should set ng-repeat offset to 226 ', function() {
                expect(this.scope.ofs).toBe(226);
            });

            it('should set top offset to 50', function() {
                // cursor = 2
                // numColumns = 2
                // offset top =
                //      cursor / numColumns * itemHeight =
                //      2 / 2 * 50 = 50
                expectTopOffset.call(this).toBe(50);
            });

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

    function getMockItems(n) {
        var arr = [];
        for(var i = 0; i < n; i++) {
            arr.push({});
        }
        return arr;
    }

});
