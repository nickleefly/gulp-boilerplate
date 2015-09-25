var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    changed      = require('gulp-changed'),
    imagemin     = require('gulp-imagemin'),
    minifyCSS    = require('gulp-minify-css'),
    size         = require('gulp-filesize'),
    uglify       = require('gulp-uglify'),
    browserify   = require('browserify'),
    source       = require('vinyl-source-stream'),
    buffer       = require('vinyl-buffer'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    vinylPaths   = require('vinyl-paths'),
    iconfont     = require('gulp-iconfont'),
    swig         = require('gulp-swig');

var dest = "./web/static",
    config = {
      sass: {
        src: "./web/css/**/*.{sass,scss}",
        dest: dest,
        settings: {
          indentedSyntax: true, // Enable .sass syntax!
          imagePath: 'images' // Used by the image-url helper
        }
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
    .pipe(gulp.dest(config.sass.dest));
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
    .pipe(gulp.dest(config.images.dest));
});

gulp.task('browserify', function () {
  return browserify([config.javascript.src + '/index.js']).bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(gulp.dest(config.javascript.dest));
});

gulp.task('clean:js', function () {
  return gulp.src(dest + '/index.min.js')
    .pipe(vinylPaths(del));
});

gulp.task('uglify', ['browserify', 'clean:js'], function() {
  return gulp.src(config.production.jsSrc)
    .pipe(rename('index.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.production.dest))
    .pipe(size());
});

gulp.task('watch', function(callback) {
  gulp.watch(config.sass.src, ['sass']);
  gulp.watch(config.images.src, ['images']);
  gulp.watch(config.javascript.src + '/*.js', ['browserify']);
});

gulp.task('default', ['sass', 'browserify', 'images']);
gulp.task('prod', ['minify', 'images', 'uglify']);
