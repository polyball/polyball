/**
 * Copied from
 * https://github.com/gulpjs/gulp/blob/8701b9dda6303429adacea4661311287e172cda3/docs/recipes/fast-browserify-builds-with-watchify.md
 * 
 * Created by kdbanman on 2/29/16.
 */

'use strict';

// REQUIREMENTS
var fs = require('fs');

var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');
var fail = require('gulp-fail');

var browserify = require('browserify');
var watchify = require('watchify');
var sass = require('gulp-sass');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var assign = require('lodash.assign');


// CONFIGURATION
var browserifyConfig = {
    entries: ['./polyball/Client.js'],
    debug: true
};

var testFile = './polyball/tests/**/*.js';
var testConfig = {
    reporter: process.env.NO_NYAN === 'true' ? 'spec' : 'nyan'
};

var lintReporter = 'jshint-stylish';
var lintConfig = {
    verbose: true
};


// TASKS
gulp.task('build-js', browserifyBundle);
gulp.task('run-tests', tests);
gulp.task('lint', lint);
gulp.task('compile-static', compileStatic);
gulp.task('default', ['lint', 'build-js', 'compile-static', 'run-tests']);

gulp.task('watch-js', watchifyBundle);

function bundle(bundler, killOnError) {
    bundler = bundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'));

    if (killOnError) {
        bundler = bundler.on('error', function () {
            process.exit(1);
        });
    }

    return bundler.pipe(source('client-bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./public/bin'));
}

function browserifyBundle() {
    var bify = browserify(browserifyConfig);

    return bundle(bify, true);
}

function tests(){
    return gulp.src(testFile, {read: false})
        .pipe(mocha(testConfig));
}

function lint_nokill() {
    return gulp.src('./polyball/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(lintReporter, lintConfig));

}

function lint(){
    return lint_nokill().pipe(jshint.reporter('fail'));
}

function watchifyBundle() {
    var opts = assign({}, watchify.args, browserifyConfig);
    var wify = watchify(browserify(opts));
    wify.on('update', function () {
        return bundle(wify, false);
    }); // on any dep update, run the bundler
    wify.on('update', lint_nokill);   // on any dep update, run the linter
    // on any dep update, run the linter
    wify.on('log', gutil.log); // output build logs to terminal

    return bundle(wify, false);
}

function compileStatic(){
    return gulp.src('./polyball/client/hudcomponents/*.scss')
        .pipe(sass().on('error', function(error){
            var message = new gutil.PluginError('sass', error.messageFormatted).toString();
            process.stderr.write(message + '\n');
            process.exit(1);
        }))
        .pipe(gulp.dest('./public/css'));

}
