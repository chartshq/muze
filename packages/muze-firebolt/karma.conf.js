module.exports = function (config) {
    config.set({
        basePath: './',
        frameworks: ['mocha', 'chai'],
        files: [
            'test.webpack.js',
        ],
        webpack: {
            module: {
                rules: [
                    // instrument only testing sources with Istanbul
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            query: {
                                presets: ['es2015'],
                            },
                        },
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.js$|\.jsx$/,
                        use: {
                            loader: 'istanbul-instrumenter-loader',
                            options: { esModules: true }
                        },
                        enforce: 'pre',
                        exclude: /node_modules|\.spec\.js$/,
                    }
                ],
            },
        },
        preprocessors: {
            'test.webpack.js': ['webpack'],
        },
        exclude: [
            '**/*.swp',
        ],

        coverageIstanbulReporter: {
            dir: 'coverage/',
            thresholds: {
                emitWarning: false,
                global: {
                    statements: 80,
                    lines: 80,
                    branches: 80,
                    functions: 80
                },
                each: {
                    statements: 80,
                    lines: 80,
                    branches: 80,
                    functions: 80,
                    overrides: {
                        'baz/component/**/*.js': {
                            statements: 80
                        }
                    }
                }
            },
            reports: ['text-summary', 'html', 'lcov'],
            fixWebpackSourcePaths: true,
            reporters: [
                { type: 'text' },
                { type: 'html', subdir: 'report-html', file: 'report.html' },
                { type: 'lcov', subdir: 'report-lcov', file: 'report.txt' },
            ],
        },

        reporters: ['spec', 'coverage-istanbul'],
        specReporter: {
            maxLogLines: 5, // limit number of lines logged per test
            suppressErrorSummary: true, // do not print error summary
            suppressFailed: false, // do not print information about failed tests
            suppressPassed: false, // do not print information about passed tests
            suppressSkipped: true, // do not print information about skipped tests
            showSpecTiming: false, // print the time elapsed for each spec
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['ChromeHeadless'],
        singleRun: true,
        concurrency: Infinity
    });
};
