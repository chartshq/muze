module.exports = function (config) {
    config.set({
        basePath: './',
        frameworks: ['mocha', 'chai'],
        files: [
            'packages/<%= packageName %>/src/**/*.spec.js'
        ],
        webpack: {
            devtool: 'inline-source-map',
            module: {
                rules: [
                    {
                        test: /\.(s*)css$/,
                        use: [
                            {
                                loader: 'style-loader',
                                options: { singleton: true }
                            },
                            { loader: 'css-loader' },
                            { loader: 'sass-loader' }
                        ],
                        exclude: /node_modules/
                    },
                    {
                        test: /\.js$|\.jsx$/,
                        use: {
                            loader: 'istanbul-instrumenter-loader',
                            options: { esModules: true }
                        },
                        enforce: 'pre',
                        exclude: /node_modules|src\/renderer\/|\.spec\.js$/
                    }
                ]
            }
        },
        webpackMiddleware: {
            noInfo: true,
            stats: {
                chunks: false
            }
        },
        preprocessors: {
            'packages/<%= packageName %>/src/**/*.spec.js': ['webpack']
        },
        exclude: [
            '**/*.swp'
        ],

        coverageIstanbulReporter: {
            dir: 'coverage/',
            thresholds: {
                emitWarning: false, // set to `true` to not fail the test command when thresholds are not met
                global: { // thresholds for all files
                    statements: 80,
                    lines: 80,
                    branches: 80,
                    functions: 80
                },
                each: { // thresholds per file
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
            reports: ['html', 'lcov', 'text-summary'],
            fixWebpackSourcePaths: true,
            reporters: [
                { type: 'text' },
                { type: 'html', subdir: 'report-html', file: 'report.html' },
                { type: 'lcov', subdir: 'report-lcov', file: 'report.txt' }
            ]
        },
        reporters: ['spec', 'coverage-istanbul'],
        specReporter: {
            maxLogLines: 5, // limit number of lines logged per test
            suppressErrorSummary: true, // do not print error summary
            suppressFailed: false, // do not print information about failed tests
            suppressPassed: false, // do not print information about passed tests
            suppressSkipped: true, // do not print information about skipped tests
            showSpecTiming: false // print the time elapsed for each spec
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },
        singleRun: true,
        concurrency: Infinity
    });
};
