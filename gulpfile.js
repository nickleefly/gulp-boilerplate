var gulp = require('gulp'),
  sass = require('gulp-sass'),
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
  iconfont = require('gulp-iconfont'),
  swig = require('gulp-swig'),
  factor = require('factor-bundle'),
  browserSync = require('browser-sync').create(),
  fs = require('fs'),
  reactify = require('reactify');

var dest = "./web/static",
  config = {
    sass: {
      src: "./web/css/**/*.{sass,scss}",
      dest: dest
    },
    images: {
      src: "./web/images/**",
      dest: dest + "/images"
    },
    javascript: {
      src: "./web/javascript",
      dest: dest
    },
    production: {
      cssSrc: dest + '/*.css',
      jsSrc: dest + '/*.js',
      dest: dest
    },
    iconfont: {
      src: './web/icons/*.svg',
      dest: dest + '/fonts',
      sassDest: './web/css',
      template: './web/css/template/template.sass.swig',
      sassOutputName: '_icons.sass',
      fontPath: '../static/fonts',
      className: 'icon',
      options: {
        fontName: 'Boilerplate',
        appendCodepoints: true,
        normalize: false
      }
    }
  };

function generateIconSass(codepoints, options) {
  gulp.src(config.iconfont.template)
    .pipe(swig({
      data: {
        icons: codepoints.map(function(icon) {
          return {
            name: icon.name,
            code: icon.codepoint.toString(16)
          }
        }),
        fontName: config.iconfont.options.fontName,
        fontPath: config.iconfont.fontPath,
        className: config.iconfont.className,
      }
    }))
    .pipe(rename(config.iconfont.sassOutputName))
    .pipe(gulp.dest(config.iconfont.sassDest));
}

gulp.task('iconfont', function() {
  return gulp.src(config.iconfont.src)
    .pipe(iconfont(config.iconfont.options))
    .on('codepoints', generateIconSass)
    .pipe(gulp.dest(config.iconfont.dest));
});

gulp.task('sass', ['iconfont'], function () {
  return gulp.src(config.sass.src)
    // .pipe(sourcemaps.init())
    .pipe(sass(config.sass.settings))
    //.pipe(sourcemaps.write())
    .pipe(autoprefixer({ browsers: ['last 2 version'] }))
    .pipe(gulp.dest(config.sass.dest))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('clean:css', function () {
  return gulp.src(dest + '/index.min.css')
    .pipe(vinylPaths(del));
});

gulp.task('minify', ['sass', 'clean:css'], function() {
  return gulp.src(config.production.cssSrc)
    .pipe(rename('index.min.css'))
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(gulp.dest(config.production.dest))
    .pipe(size());
});

gulp.task('images', function() {
  return gulp.src(config.images.src)
    .pipe(changed(config.images.dest)) // Ignore unchanged files
    .pipe(imagemin()) // Optimize
    .pipe(gulp.dest(config.images.dest))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('browserify', function () {
  // return browserify({
  //   entries: [
  //     config.javascript.src + '/index.js',
  //     config.javascript.src + '/featureA.js',
  //     config.javascript.src + '/featureB.js'
  //   ], // Only need initial file, browserify finds the deps
  //   transform: [reactify], // We want to convert JSX to normal javascript
  //   debug: true, // Gives us sourcemapping
  //   cache: {}, packageCache: {}, fullPaths: true
  // })
  // .plugin(factor, { o: [
  //   config.javascript.dest + '/index.js',
  //   config.javascript.dest + '/featureA.js',
  //   config.javascript.dest + '/featureB.js'
  //   ]
  // })
  // .bundle() // Create the initial bundle when starting the task
  // .pipe(source(config.javascript.dest + '/common.js'));
  // return browserify([config.javascript.src + '/index.js']).bundle()
  //   .pipe(source('index.js'))
  //   .pipe(buffer())
  //   .pipe(gulp.dest(config.javascript.dest)).pipe(browserSync.reload({
  //     stream: true
  //   }));

  var files = [
    config.javascript.src + '/index.js',
    config.javascript.src + '/featureB.js'
  ];
  return  browserify(files)
  .plugin(factor, { o: [
    config.javascript.dest + '/index.js',
    config.javascript.dest + '/featureB.js'
    ]
  })
  .bundle().pipe(fs.createWriteStream( config.javascript.dest + '/common.js'));
});

gulp.task('clean:js', function () {
  return gulp.src(dest + '/index.min.js')
    .pipe(vinylPaths(del));
});

gulp.task('uglify', ['browserify', 'clean:js'], function() {
  return gulp.src(config.production.jsSrc)
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(config.production.dest))
    .pipe(size());
});

gulp.task('browser-sync', function() {
  browserSync.init({
    files: ['web/static/*.css', 'web/static/*.js'],
    // server: {
    //   baseDir: "web",
    //   index: "index.html"
    // },
    // proxy: "proxyurl",
    // port: 8000
    proxy: {
      target: "http://127.0.0.1:8080",
      reqHeaders: function (config) {
        return {
          "host": config.urlObj.host,
          "accept-encoding": "identity",
          "agent": false
        }
      }
    }
  });
});

gulp.task('watch', ['browser-sync'], function(callback) {
  gulp.watch(config.sass.src, ['sass'], browserSync.reload);
  gulp.watch(config.images.src, ['images'], browserSync.reload);
  gulp.watch(config.javascript.src + '/*.js', ['browserify'], browserSync.reload);
});

gulp.task('default', ['sass', 'browserify', 'images']);
gulp.task('prod', ['minify', 'images', 'uglify']);
