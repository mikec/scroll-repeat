module.exports = function(config) {
    config.set({
        frameworks: [
            'jasmine-jquery',
            'jasmine'
        ],
        reporters: ['progress', 'coverage'],
        browsers: ['Chrome'],
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
            'test/browserTrigger.js',
            'src/**/*.js',
            'demo/**/*.js'
        ]

    });
};
