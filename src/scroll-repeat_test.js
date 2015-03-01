
describe('scrollRepeat', function() {

    beforeEach(module('litl'));

    beforeEach(inject(function($rootScope, $compile, $window) {
        this.$rootScope = $rootScope;
        this.scope = $rootScope.$new();
        this.$compile = $compile;
        this.$window = $window;
    }));

    // assuming bufferAmt = 30;

    describe('with 10 items on screen', function() {

        beforeEach(function() {
            this.$window.innerHeight = 100;
            this.scope.items = getMockItems(500);
            this.element = this.$compile(getTmpl(10))(this.scope);
            angular.element(this.$window.document.body).append(this.element);
            this.$rootScope.$digest();
        });

        // 10 + (10 * 30) = 310

        it('should set ng-repeat limit to -310', function() {
            // 10 + (10 * 30)
            expect(this.scope.lim).toBe(-310);
        });

        it('should set ng-repeat offset to 310', function() {
            expect(this.scope.ofs).toBe(310);
        });

        it('should set top padding to 0', function() {
            expect(parseInt(this.element.css('padding-top'))).toBe(0);
        });

        it('should set bottom padding to 1900', function() {
            // (500 * 10) - (310 * 10)
            expect(parseInt(this.element.css('padding-bottom'))).toBe(1900);
        });

    });

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

