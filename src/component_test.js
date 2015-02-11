
describe('init', function() {

    beforeEach(module('my-module'));

    beforeEach(inject(function($rootScope, $compile) {
        this.scope = $rootScope.$new();
        this.element = $compile('<div my-directive></div>')(this.scope);
        this.scope.$digest();
    }));

    it('should set foo to bar', function() {
        expect(this.scope.foo).toBe('bar');
    });

});
