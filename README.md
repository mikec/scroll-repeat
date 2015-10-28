
scroll-repeat
=============

[![Build Status](https://travis-ci.org/mikec/scroll-repeat.svg?branch=master)](https://travis-ci.org/mikec/scroll-repeat)

Angular directive for displaying a large number of items (100,000+) in a scrolling view.


How it works
------------

scroll-repeat wraps Angular's ng-repeat directive, and provides optimized loading and unloading of on-screen and off-screen elements based on scroll position.

You can lay your items out any way you want, as long as they are all the same height and width. See our [demo](https://mikec.github.com/scroll-repeat) for some examples.


Usage
-----

Get it with bower

    bower install scroll-repeat

Reference the script

    <script src="path/to/scroll-repeat.js"></script>

Add our module to your app

    angular.module('myApp', ['litl']);

Use it just like you use `ng-repeat`

    <div scroll-repeat="item in items">
        <span>{{item.name}}</span>
    </div>


Advanced Features
-----------------

### Detect Clipping

When the browser's scroll position is changed too fast to keep up with the item rendering buffer, "clipping" may occur. You can detect when clipping occurs by watching the following properties:

    // "top clipping" means items are missing from the top of the view
    $scope.$watch('scrollRepeatClippingTop', function(val) {
        // if val == true, top clipping is occuring
    });

    // "bottom clipping" means items are missing from the bottom of the view
    $scope.$watch('scrollRepeatClippingBottom', function(val) {
        // if val == true, bottom clipping is occuring
    });

These properties can help you display an indication that items are being loaded.

scroll-repeat does not use isolated scope, so these properties are set on the scope where you define the directive.

[Detect clipping demo](https://mikec.github.com/scroll-repeat/#/detect-clipping)


### Placeholders

Empty placeholders are shown when scrolling moves too fast to keep up with ng-repeat data binding. These can be styled with the `scroll-repeat-item-placeholder` class.

By default, these placeholder items have no content. Content for placeholders can be defined separately from the bound item template, by using `scroll-repeat-item` and `scroll-repeat-placeholder`:

    <div scroll-repeat="item in items">

        <div scroll-repeat-item>
            // content for bound items
            <span>{{item.name}}</span>
        </div>

        <div scroll-repeat-placeholder>
            // content for placeholder items
            <span>LOADING</span>
        </div>

    </div>

[Placeholders demo](https://mikec.github.com/scroll-repeat/#/placeholders)


Development
-----------

Install npm dependencies

    npm install

Install bower dependencies

    bower install

Run grunt

    grunt

View the demo locally

    http://localhost:8000


Known Issues
------------

* The more items you display on the screen at once, the larger the item buffer above and below the screen will be. This can result in performance issues if you try to cram too many items on the screen. The decrease in performance is especially noticable when using the scrollbar to make drastic jumps up and down the page.

* Item offset position is calculated incorrectly on some mobile browsers (such as Safari for iOS) when scrolling causes the address bar to change width. This makes the items change position unexpectedly after scrolling comes to rest.

