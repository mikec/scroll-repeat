
describe('scrollRepeat', function() {

    beforeEach(module('litl'));

    beforeEach(inject(function($rootScope, $compile) {
        this.scope = $rootScope.$new();
        this.scope.items = [
            {},{},{},{}
        ];
        this.element = $compile('<div scroll-repeat="itm in items"></div>')(this.scope);
        this.scope.$digest();
    }));

    it('should', function() {
        //
    });

});
