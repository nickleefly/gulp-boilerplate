var gulp = require('gulp'),
  less = require('gulp-less'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  changed = require('gulp-changed'),
  imagemin = require('gulp-imagemin'),
  minifyCSS = require('gulp-minify-css'),
  size = require('gulp-filesize'),
  uglify = require('gulp-uglify'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  rename = require('gulp-rename'),
  del = require('del'),
  vinylPaths = require('vinyl-paths'),
  factor = require('factor-bundle'),
  browserSync = require('browser-sync').create(),
  reactify = require('reactify')

var dest = './web/static',
  config = {
    less: {
      src: './web/css/**/*.less',
      dest: dest
    },
    images: {
      src: './web/images/**',
      dest: dest + '/images'
    },
    javascript: {
      src: './web/javascript',
      dest: dest
    },
    production: {
      cssSrc: dest + '/*.css',
      jsSrc: dest + '/*.js',
      dest: dest
    },
    font: {
      src: './web/fonts',
      dest: dest
    }
}
gulp.task('copy', function () {
  return gulp.src('./node_modules/bootstrap/fonts/glyphicons-halflings-regular.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(config.font.dest + '/fonts/'))
})

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
  autoprefix = new LessPluginAutoPrefix({browsers: ['last 2 versions']})

gulp.task('less', ['copy'], function () {
  return gulp.src(config.less.src)
    .pipe(less({
      plugins: [autoprefix]
    }))
    .pipe(gulp.dest(config.less.dest))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('clean:css', function () {
  return gulp.src(dest + '/index.min.css')
    .pipe(vinylPaths(del))
})

gulp.task('minify', ['less', 'clean:css'], function () {
  return gulp.src(config.production.cssSrc)
    .pipe(rename('index.min.css'))
    .pipe(minifyCSS({keepBreaks: true}))
    .pipe(gulp.dest(config.production.dest))
    .pipe(size())
})

gulp.task('images', function () {
  return gulp.src(config.images.src)
    .pipe(changed(config.images.dest)) // Ignore unchanged files
    .pipe(imagemin()) // Optimize
    .pipe(gulp.dest(config.images.dest))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('browserify', function () {
  return browserify({
    entries: [
      config.javascript.src + '/index.js',
      config.javascript.src + '/featureA.js',
      config.javascript.src + '/featureB.js'
    ], // Only need initial file, browserify finds the deps
    transform: [reactify], // We want to convert JSX to normal javascript
    debug: true, // Gives us sourcemapping
    cache: {}, packageCache: {}, fullPaths: true
  })
    .plugin(factor, { o: [
        config.javascript.dest + '/index.js',
        config.javascript.dest + '/featureA.js',
        config.javascript.dest + '/featureB.js'
      ]
    })
    .bundle() // Create the initial bundle when starting the task
    .pipe(source('common.js'))
    .pipe(gulp.dest(config.javascript.dest))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('clean:js', function () {
  return gulp.src(dest + '/*.min.js')
    .pipe(vinylPaths(del))
})

gulp.task('uglify', ['browserify', 'clean:js'], function () {
  return gulp.src(config.production.jsSrc)
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(config.production.dest))
    .pipe(size())
})

gulp.task('browser-sync', function () {
  browserSync.init({
    files: ['web/static/*.css', 'web/static/*.js'],
    // server: {
    //   baseDir: "web",
    //   index: "index.html"
    // },
    // proxy: "proxyurl",
    // port: 8000
    proxy: {
      target: 'http://127.0.0.1:8080',
      reqHeaders: function (config) {
        return {
          'host': config.urlObj.host,
          'accept-encoding': 'identity',
          'agent': false
        }
      }
    }
  })
})

gulp.task('watch', ['browser-sync'], function (callback) {
  gulp.watch(config.less.src, ['less'], browserSync.reload)
  gulp.watch(config.images.src, ['images'], browserSync.reload)
  gulp.watch(config.javascript.src + '/**/*.js', ['browserify'], browserSync.reload)
})

gulp.task('default', ['less', 'browserify', 'images'])
gulp.task('prod', ['minify', 'images', 'uglify'])
