
angular.module('demoApp', ['litl'])
.controller('DemoCtrl', function() {

    this.things = generateArray(10000);

});

function generateArray(len) {
    var arr = [];
    for(var i=0; i < len; i++) {
        arr.push({ number: (i+1) });
    }
    return arr;
}