const { src, dest, parallel, series, watch } = require('gulp');
const scss = require('gulp-sass');
const minifyCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;

function server() {
  browserSync.init({
    server: {
      baseDir: './build/',
    },
    tunnel: true,
  });
  browserSync.watch('build', browserSync.reload);
}

function html() {
  return src('src/html/index.html')
    .pipe(dest('build/'))
    .on('end', browserSync.reload);
}

function css() {
  return src(['src/scss/*.scss', '!src/scss/libs.scss'])
    .pipe(sourcemaps.init())
    .pipe(scss())
    .pipe(autoprefixer())
    .on(
      'error',
      notify.onError({
        message: 'Error: <%= error.message %>',
        title: 'Error running something',
      })
    )
    .pipe(minifyCSS())
    .pipe(sourcemaps.write())
    .pipe(dest('build/css'))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
}

function js() {
  return src('src/js/*.js', { sourcemaps: true })
    .pipe(concat('script.js'))
    .pipe(uglify())
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(dest('build/js', { sourcemaps: true }));
}

function jsLibs() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
  ])
    .pipe(concat('jsLibs.js'))
    .pipe(dest('build/js'));
}

function images() {
  return src('src/img/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
      ])
    )
    .pipe(dest('build/img'));
}

function watchFiles() {
  watch('src/scss/*.scss', series(css));
  watch('src/html/index.html', series(html));
  watch('src/js/*.js', series(js));
  watch('src/img/*', series(images));
}

const startWatch = parallel(watchFiles, server);

exports.images = images;
exports.js = js;
exports.jsLibs = jsLibs;
exports.html = html;
exports.css = css;
exports.watch = watchFiles;
exports.server = server;
exports.build = parallel(html, css, js, jsLibs, images);
exports.default = series(parallel(html, css, js, jsLibs, images), startWatch);
