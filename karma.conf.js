module.exports = function(config) {
    config.set({
        frameworks: [
            'jasmine-jquery',
            'jasmine'
        ],
        reporters: ['progress', 'coverage'],
        browsers: ['PhantomJS'],
        autoWatch: true,

        preprocessors: {
            'src/**/*.js': 'coverage'
        },

        coverageReporter: {
            type : 'text'
        },

        files : [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'test/**/*.js',
            'src/**/*.js'
        ]

    });
};
