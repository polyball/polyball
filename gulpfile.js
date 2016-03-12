/**
 * Copied from
 * https://github.com/gulpjs/gulp/blob/8701b9dda6303429adacea4661311287e172cda3/docs/recipes/fast-browserify-builds-with-watchify.md
 * 
 * Created by kdbanman on 2/29/16.
 */

'use strict';

// REQUIREMENTS
var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');

var browserify = require('browserify');
var watchify = require('watchify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var assign = require('lodash.assign');


// CONFIGURATION
var browserifyConfig = {
    entries: ['./polyball/Client.js'],
    debug: true
};

var testFile = './polyball/tests/**/*.js';
var testReporter = 'nyan'

var lintReporter = 'jshint-stylish';
var lintConfig = {
    verbose: true
};


// TASKS
gulp.task('build-js', browserifyBundle);
gulp.task('run-tests', tests);
gulp.task('lint', lint);
gulp.task('default', ['lint', 'build-js', 'run-tests']);

gulp.task('watch-js', watchifyBundle);

function bundle(bundler) {
    return bundler.bundle()
        // log errors if they happen
        //.on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .on('error', function(err){
            console.log(err);
            this.emit('end');})
        .pipe(source('client-bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./public/bin'));
}

function browserifyBundle() {
    var bify = browserify(browserifyConfig);
    return bundle(bify);
}

function tests(){
    return gulp.src(testFile, {read: false})
        .pipe(mocha({reporter: testReporter}));
}

function lint(){
    return gulp.src('./polyball/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(lintReporter, lintConfig))
        .pipe(jshint.reporter('fail'));
}

function watchifyBundle() {
    var opts = assign({}, watchify.args, browserifyConfig);
    var wify = watchify(browserify(opts));
    wify.on('update', bundle); // on any dep update, run the bundler
    wify.on('update', lint);   // on any dep update, run the linter
    wify.on('log', gutil.log); // output build logs to terminal
    return bundle(wify);
}
