/**
 * Copied from
 * https://github.com/gulpjs/gulp/blob/8701b9dda6303429adacea4661311287e172cda3/docs/recipes/fast-browserify-builds-with-watchify.md
 * 
 * Created by kdbanman on 2/29/16.
 */

'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var mocha = require('gulp-mocha');

// add custom browserify options here
var customOpts = {
    entries: ['./polyball/client.js'],
    debug: true
};
var testFile = './polyball/tests/test.js';
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('watch-js', bundle); // so you can run `gulp js` to build the file
gulp.task('run-tests', tests);
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
    return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('client-bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./public/bin'));
}

function tests(){
    return gulp.src(testFile, {read: false})
        .pipe(mocha({reporter: 'nyan'}));
}