
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

        describe('when window is resized resulting in item height change', function() {

            beforeEach(function() {
                this.$window.innerHeight = 150;
                $j('.scroll-repeat-item').height(20);
                browserTrigger(this.$window.document.body, 'resize');
            });

            // numItemsOnScreen = 150 / 20 = 8
            // numAllowedItems = 8 + (8 * 30) = 248

            it('should set ng-repeat limit to -248', function() {
                expect(this.scope.lim).toBe(-248);
            });

            it('should set ng-repeat offset to 248', function() {
                expect(this.scope.ofs).toBe(248);
            });

            it('should set top padding to 0', function() {
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
            angular.element(this.$window.document.body).append(this.element);
            this.$rootScope.$digest();
            this.$timeout.flush();
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

    describe('when initial number of items is 0', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.scope.items = [];
            this.element = this.$compile(getTmpl(10))(this.scope);
            angular.element(this.$window.document.body).append(this.element);
            this.$rootScope.$digest();
            this.$timeout.flush();
        });

        it('should set ng-repeat limit to the buffer amount * -1', function() {
            expect(this.scope.lim).toBe(-30);
        });

        it('should set ng-repeat offset to the buffer amount', function() {
            expect(this.scope.ofs).toBe(30);
        });

        it('should set top padding to 0', function() {
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

            it('should set top padding to 0', function() {
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
            angular.element(this.$window.document.body).append(this.element);
            this.$rootScope.$digest();
            this.$timeout.flush();
        });

        it('should work...', function() {

        });

    });

    function expectTopOffset() {
        var t = this.element.css('transform');
        var transX = parseInt((new WebKitCSSMatrix(t)).m42);
        return expect(transX);
    }

    function scrollWindowTo(win, xCoord) {
        win.document.body.scrollTop = xCoord;
        browserTrigger(win.document.body, 'scroll');
    };

    function getTmpl(itmHeight, itmWidth) {
        var e = angular.element('<div scroll-repeat="itm in items"></div>');
        var innerElem = angular.element('<div></div>');
        innerElem.css('height', itmHeight + 'px');
        if(itmWidth > 0) {
            $j(innerElem).css('float', 'left');
            $j(innerElem).width(itmWidth);
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
