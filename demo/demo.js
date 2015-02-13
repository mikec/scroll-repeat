
angular.module('demoApp', ['litl'])
.controller('DemoCtrl', function() {

    this.stuff = generateArray(100);

});

function generateArray(len) {
    var arr = [];
    for(var i=0; i < len; i++) {
        arr.push({ name: 'thing ' + i });
    }
    return arr;
}