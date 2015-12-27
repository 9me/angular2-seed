/* jscs: disable requireCamelCaseOrUpperCaseIdentifiers */
'use strict';

/**
 * External dependencies
 */
var del = require('del');
var gulp = require('gulp');
var karma = require('karma');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var jscs = require('gulp-jscs');
var debounce = require('debounce');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var cached = require('gulp-cached');
var filter = require('gulp-filter');
var wrapper = require('gulp-wrapper');
var vinylBuffer = require('vinyl-buffer');
var mergeStream = require('merge-stream');
var injectInHtml = require('gulp-inject');
var stylish = require('gulp-jscs-stylish');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var preprocess = require('gulp-preprocess');
var ngConstant = require('gulp-ng-constant');
var autoprefixer = require('gulp-autoprefixer');
var vinylSourceStream = require('vinyl-source-stream');
var inlineTemplate = require('gulp-inline-ng2-template');
var removeEmptyLines = require('gulp-remove-empty-lines');
var removeHtmlComments = require('gulp-remove-html-comments');

/**
 * Application dependencies
 */
var mergeSources = require('./utils/merge-sources');

/**
 * Helper vars
 */
var pkg = require('./package.json');
var env = require('./env')();
var config = require('./config');
var build = config.build;
var noop = function() {};

/*****************************************************************************
 * Helpers
 ***/

/**
 * Get package file name
 */
function packageFileName(filename, ext) {
  if (!ext) {
    ext = filename;
    filename = pkg.name.toLowerCase();
  }
  return filename + '-' + pkg.version + (ext || '');
}

/**
 * Get prefixed Angular module name
 */
function angularModuleName(module) {
  return 'App.' + module;
}

/**
 * Generate banner wrapper for compiled files
 */
function bannerWrapper() {

  //Get date and author
  var today = new Date();
  var date = today.getDate() + '-' + today.getMonth() + '-' + today.getFullYear();
  var author = pkg.author.name + ' <' + pkg.author.email + '>';

  //Format banner
  var banner =
    '/**\n' +
    ' * ' + pkg.name + ' - v' + pkg.version + ' - ' + date + '\n' +
    ' * ' + pkg.homepage + '\n' +
    ' *\n' +
    ' * Copyright (c) ' + today.getFullYear() + ' ' + author + '\n' +
    ' */\n';

  //Return wrapper
  return {
    header: banner,
    footer: ''
  };
}

/**
 * Environment module stream
 */
function environmentStream() {

  //Create new stream and write config object as JSON string
  var fileName = 'app.env.js';
  var stream = vinylSourceStream(fileName);
  stream.write(JSON.stringify({}));

  //Create ENV constant for configuration and append environment data
  var ENV = config;
  ENV.environment = env;
  ENV.isDevelopment = env !== 'production';
  ENV.isProduction = env === 'production';

  //Turn into angular constant module JS file
  return stream
    .pipe(vinylBuffer())
    .pipe(ngConstant({
      name: angularModuleName('Env'),
      stream: true,
      constants: {
        ENV: ENV
      }
    }))
    .pipe(rename(fileName));
}

/**
 * Helper to refresh config
 */
function refreshConfig(cb) {
  config = require('./config');
  cb();
}

/*****************************************************************************
 * Builders
 ***/

/**
 * Clean the public folder
 */
function cleanPublicFolder() {
  return del(build.paths.public, {
    dot: true
  });
}

/**
 * Build (copy) static client assets
 */
function buildStatic() {
  return gulp.src(build.assets.static)
    .pipe(gulp.dest(build.paths.public));
}

/**
 * Build application JS files
 */
function buildAppJs() {

  //Create stream
  var stream = gulp.src(build.assets.js.app);

  //Initialize source map
  if (build.js.sourcemap.app) {
    stream = stream.pipe(sourcemaps.init());
  }

  //Inline Angular templates and transpile typescript
  stream = stream
    .pipe(inlineTemplate({
      base: '/app',
      html: true,
      css: false,
      target: 'es6',
      indent: 2
    }))
    .pipe(typescript({
      noImplicitAny: true
    }));

  //Minify
  if (build.js.minify.app) {
    stream = stream
      .pipe(concat(packageFileName('.min.js')))
      .pipe(uglify());
  }

  //Write source map
  if (build.js.sourcemap.app) {
    stream = stream.pipe(sourcemaps.write('./'));
  }

  //Determine destination
  var dest = build.paths.public + '/js';
  if (!build.js.minify.app) {
    dest += '/app';
  }

  //Create map filter, add banner and write to destination folder
  var mapFilter = filter(['!*.map']);
  return stream
    .pipe(mapFilter)
    .pipe(wrapper(bannerWrapper()))
    .pipe(mapFilter.restore())
    .pipe(gulp.dest(dest));
}

/**
 * Build vendor javascript files
 */
function buildVendorJs(done) {

  //No CSS?
  if (!build.assets.js.vendor.length) {
    return done();
  }

  //Create stream
  var stream = gulp.src(mergeSources(
    build.assets.js.vendor
    // './node_modules/babel-core/browser-polyfill.js'
  ));

  //Initialize source map
  if (build.js.sourcemap.vendor) {
    stream = stream.pipe(sourcemaps.init());
  }

  //Minify
  if (build.js.minify.vendor) {
    stream = stream
      .pipe(concat(packageFileName('vendor', '.min.js')))
      .pipe(uglify());
  }

  //Write source map
  if (build.js.sourcemap.vendor) {
    stream = stream.pipe(sourcemaps.write('./'));
  }

  //Determine destination
  var dest = build.paths.public + '/js';
  if (!build.js.minify.vendor) {
    dest += '/vendor';
  }

  //Write to destination folder
  return stream.pipe(gulp.dest(dest));
}

/**
 * Build application SCSS files
 */
function buildAppScss() {

  //Create stream
  var stream = gulp.src(build.assets.scss.main)
    .pipe(sass().on('error', sass.logError));

  //Initialize source map
  if (build.css.sourcemap.app) {
    stream = stream.pipe(sourcemaps.init());
  }

  //Apply auto prefixer
  stream = stream.pipe(autoprefixer({
    browsers: ['last 2 versions']
  }));

  //Minifying?
  if (build.css.minify.app) {
    stream = stream
      .pipe(csso())
      .pipe(rename(packageFileName('.min.css')));
  }

  //Write sourcemap
  if (build.css.sourcemap.app) {
    stream = stream.pipe(sourcemaps.write('./'));
  }

  //Determine destination
  var dest = build.paths.public + '/css';
  if (!build.css.minify.app) {
    dest += '/app';
  }

  //Write to destination
  return stream.pipe(gulp.dest(dest));
}

/**
 * Process vendor CSS files
 */
function buildVendorCss(done) {

  //No CSS?
  if (!build.assets.css.vendor.length) {
    return done();
  }

  //Get stream
  var stream = gulp.src(build.assets.css.vendor);

  //Minify
  if (build.css.minify.vendor) {

    //Initialize source map
    if (build.css.sourcemap.vendor) {
      stream = stream.pipe(sourcemaps.init());
    }

    //Minify
    stream = stream
      .pipe(concat(packageFileName('vendor', '.min.css')))
      .pipe(csso());

    //Write source map
    if (build.css.sourcemap.vendor) {
      stream = stream.pipe(sourcemaps.write('./'));
    }
  }

  //Determine destination
  var dest = build.paths.public + '/css';
  if (!build.css.minify.vendor) {
    dest += '/vendor';
  }

  //Write to destination folder
  return stream.pipe(gulp.dest(dest));
}

/**
 * Build index.html file
 */
function buildIndex() {

  //Prepare files in the correct order
  var files = [];

  //Vendor JS
  if (build.assets.js.vendor.length > 0) {
    if (build.js.minify.vendor) {
      files.push('js/' + packageFileName('vendor', '.min.js'));
    }
    else {
      files.push('js/vendor/**/*.js');
    }
  }

  //App JS
  if (build.js.minify.app) {
    files.push('js/' + packageFileName('.min.js'));
  }
  else {
    files.push('js/app/**/*.js');
  }

  //Minified vendor CSS
  if (build.assets.css.vendor.length > 0) {
    if (build.css.minify.vendor) {
      files.push('css/' + packageFileName('vendor', '.min.css'));
    }
    else {
      files.push('css/vendor/**/*.css');
    }
  }

  //App CSS
  if (build.css.minify.app) {
    files.push('css/' + packageFileName('.min.css'));
  }
  else {
    files.push('css/app/**/*.css');
  }

  //Read sources
  var sources = gulp.src(files, {
    cwd: build.paths.public,
    read: false
  });

  //Run task
  return gulp.src(build.assets.index)
    .pipe(injectInHtml(sources, {
      addRootSlash: false
    }))
    .pipe(preprocess({
      context: {
        ENV: env,
        APP: config.client.app
      }
    }))
    .pipe(removeHtmlComments())
    .pipe(removeEmptyLines())
    .pipe(gulp.dest(build.paths.public));
}

/*****************************************************************************
 * Linting and testing
 ***/

/**
 * Lint app code
 */
function lintAppJs() {
  return gulp.src(mergeSources(
    build.assets.js.app,
    build.assets.js.tests
  )).pipe(cached('lintClient'))
    .pipe(jshint())
    .pipe(jscs())
    .on('error', noop)
    .pipe(stylish.combineWithHintResults())
    .pipe(jshint.reporter('jshint-stylish'));
}

/**
 * Run unit tests
 */
function testAppJs(done) {

  //Get files for testing (karma doesn't like negated globs and throws a warning)
  var files = mergeSources(
    build.assets.js.vendor,
    build.assets.js.karma,
    build.assets.js.app,
    build.assets.js.tests
  ).filter(function(glob) {
    if (glob && glob[0] === '!') {
      return false;
    }
    return true;
  });

  //Run karma server
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    files: files
  }, done).start();
}

/*****************************************************************************
 * Watchers
 ***/

/**
 * Watch client side code
 */
function watchAppJs() {
  gulp.watch(mergeSources(
    build.assets.js.app,
    build.assets.html
  ), debounce(gulp.series(
    lintAppJs, testAppJs, buildAppJs, buildIndex
  ), 200));
}

/**
 * Watch client side tests
 */
function watchAppTests() {
  gulp.watch(build.assets.js.tests, debounce(gulp.series(
    lintAppJs, testAppJs
  ), 200));
}

/**
 * Watch vendor code
 */
function watchVendorJs() {
  gulp.watch(build.assets.js.vendor, debounce(gulp.series(
    buildVendorJs, buildIndex
  ), 200));
}

/**
 * Watch app SCSS
 */
function watchAppScss() {
  gulp.watch(build.assets.scss.app, debounce(gulp.series(
    buildAppScss
  ), 200));
}

/**
 * Watch vendor CSS
 */
function watchVendorCss() {
  gulp.watch(build.assets.css.vendor, debounce(gulp.series(
    buildVendorCss, buildIndex
  ), 200));
}

/**
 * Watch static files
 */
function watchStatic() {
  gulp.watch(build.assets.static, debounce(gulp.series(
    buildStatic
  ), 200));
}

/**
 * Watch index HTML file
 */
function watchIndex() {
  gulp.watch(build.assets.index, debounce(gulp.series(
    buildIndex
  ), 200));
}

/**
 * Watch environment files
 */
function watchEnv() {
  gulp.watch(build.assets.env.js, debounce(gulp.series(
    refreshConfig, lintAppJs, testAppJs, buildAppJs, buildIndex
  ), 200));
}

/*****************************************************************************
 * Starters
 ***/

/**
 * Start lite server
 */
function startLiteServer(done) {

  //Run lite server through NPM
  var exec = require('child_process').exec;
  var child = exec('npm run start', function(err) {
    done(err);
  });

  //Pipe output
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

/*****************************************************************************
 * CLI exposed tasks
 ***/

/**
 * Build the application
 */
gulp.task('build', gulp.series(
  cleanPublicFolder,
  gulp.parallel(
    buildStatic,
    buildAppJs, buildAppScss,
    buildVendorJs, buildVendorCss
  ),
  buildIndex
));

/**
 * Start server
 */
gulp.task('start', startLiteServer);

/**
 * Watch files for changes
 */
gulp.task('watch', gulp.parallel(
  watchAppJs, watchAppTests, watchAppScss,
  watchVendorJs, watchVendorCss,
  watchIndex, watchStatic, watchEnv
));

/**
 * Linting and testing
 */
gulp.task('lint', lintAppJs);
gulp.task('test', testAppJs);

/**
 * Default task
 */
gulp.task('default', gulp.series(
  gulp.parallel('lint', 'test'), 'build', gulp.parallel('watch', 'start')
));

/**
 * Helper tasks accessible via CLI
 */
gulp.task('clean', cleanPublicFolder);
gulp.task('static', buildStatic);
