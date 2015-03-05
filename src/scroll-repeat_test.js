
describe('scrollRepeat', function() {

    beforeEach(module('litl'));

    beforeEach(inject(function($rootScope, $compile, $window, $timeout) {
        this.$rootScope = $rootScope;
        this.scope = $rootScope.$new();
        this.$compile = $compile;
        this.$window = $window;
        this.$timeout = $timeout;
    }));

    // assuming bufferAmt = 30;

    describe('with 10 items on screen', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(5000);
            this.element = this.$compile(getTmpl(10))(this.scope);
            angular.element(this.$window.document.body).append(this.element);
            this.$rootScope.$digest();
        });

        // numRenderedItems = 10 + (10 * 30) = 310

        it('should set ng-repeat limit to -310', function() {
            expect(this.scope.lim).toBe(-310);
        });

        it('should set ng-repeat offset to 310', function() {
            expect(this.scope.ofs).toBe(310);
        });

        it('should set top padding to 0', function() {
            expectTopOffset.call(this).toBe(0);
        });

        describe('after scrolling down past the buffer', function() {

            beforeEach(function() {
                scrollWindowTo(this.$window, 1510);
                this.$timeout.flush(250);
            });

            it('should set ng-repeat offset to 311 ', function() {
                expect(this.scope.ofs).toBe(311);
            });

            it('should set top padding to 10', function() {
                // (311 - 310) * 10
                expectTopOffset.call(this).toBe(10);
            });

        });

    });

    describe('when number of items is less than allowed number ' +
                'of rendered items', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(3);
            this.element = this.$compile(getTmpl(10))(this.scope);
            angular.element(this.$window.document.body).append(this.element);
            this.$rootScope.$digest();
        });

        it('should set ng-repeat limit to -3', function() {
            expect(this.scope.lim).toBe(-3);
        });

        it('should set ng-repeat offset to 3', function() {
            expect(this.scope.ofs).toBe(3);
        });

        it('should set top padding to 0', function() {
            expectTopOffset.call(this).toBe(0);
        });

    });

    function expectTopOffset() {
        var t = this.element.css('transform');
        var px = t.match(/translateY\((.*)\)/)[1];
        return expect(parseInt(px));
    }

    function scrollWindowTo(win, xCoord) {
        win.document.body.scrollTop = xCoord;
        browserTrigger(win.document.body, 'scroll');
    };

    function getTmpl(itmHeight) {
        var e = angular.element('<div scroll-repeat="itm in items"></div>');
        var innerElem = angular.element('<div></div>');
        innerElem.css('height', itmHeight + 'px');
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
