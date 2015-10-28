var mockWindow = {
    document: {
        documentElement: {
            scrollTop: 0
        },
        body: {
            scrollTop: 0
        }
    }
};

var mockWindowElem = {
    boundEvents: {},
    bind: function(eventName, fn) {
        mockWindowElem.boundEvents[eventName] = fn;
    }
};

var mockBodyElem = {
    css: function() { }
};


var ngElem = angular.element;
angular.element = function(elem) {
    if(elem === mockWindow) {
        return mockWindowElem;
    } else if(elem === mockWindow.document.body) {
        return mockBodyElem;
    } else {
        return ngElem(elem);
    }
};