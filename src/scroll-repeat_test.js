
describe('scrollRepeat', function() {

    beforeEach(module('litl'));

    beforeEach(inject(function($rootScope, $compile, $window, $timeout) {
        this.$rootScope = $rootScope;
        this.scope = $rootScope.$new();
        this.$compile = $compile;
        this.$window = $window;
        this.$timeout = $timeout;
        this.body = $j($window.document.body);
    }));

    afterEach(inject(function($document) {
        $document.find('body').html('');
    }));

    // assuming bufferAmt = 30;

    describe('with 10 items on screen', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
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
            expect(this.body.height()).toBe(50000);
        });

        describe('after scrolling down past the buffer', function() {

            beforeEach(function() {
                scrollWindowTo.call(this, 1510);
                this.$timeout.flush(250);
            });

            it('should set ng-repeat offset to 311 ', function() {
                expect(this.scope.ofs).toBe(311);
            });

            it('should set top offset to 10', function() {
                // (311 - 310) * 10
                expectTopOffset.call(this).toBe(10);
            });

        });

        describe('when window is resized resulting in item height change', function() {

            beforeEach(function() {
                this.$window.innerHeight = 150;
                $j('.scroll-repeat-item').height(20);
                browserTrigger(this.body, 'resize');
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

    describe('when number of items is less than allowed number ' +
                'of rendered items', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(3);
            this.element = this.$compile(getTmpl(10))(this.scope);
            this.body.append(this.element);
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
            expect(this.body.height()).toBe(30);
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


    describe('with 10 items on screen and 2 items to a row', function() {

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
        });

        it('should set body height to 25000', function() {
            // 100 / 50 = 2
            // (5000 / 2) * 10 = 25000
            expect(this.body.height()).toBe(25000);
        });

        describe('when window is resized, and there are 3 items in a row',
        function() {

            beforeEach(function() {
                this.$window.innerWidth = 150;
                this.body.width(150);
                browserTrigger(this.body, 'resize');
            });

            it('should set body height to 16667', function() {
                // 150 / 50 = 3
                // (5000 / 3) * 10 = 16667
                expect(this.body.height()).toBe(16667);
            });

        });

    });

    describe('when top and bottom clipping occurs', function() {

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
            this.$timeout.flush(250);
            scrollWindowTo.call(this, 0);
        });

        it('should set scrollRepeatClippingBottom to true', function() {
            expect(this.clipWatcherBottom).toEqual(true);
        });

        it('should set scrollRepeatClippingTop to true', function() {
            expect(this.clipWatcherTop).toEqual(true);
        });

    });

    function expectTopOffset() {
        var t = this.element.css('transform');
        var transX = parseInt((new WebKitCSSMatrix(t)).m42);
        return expect(transX);
    }

    function scrollWindowTo(xCoord) {
        this.body.scrollTop(xCoord);
        browserTrigger(this.body, 'scroll');
    };

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
