const target_folder = 'dist';
const source_folder = '#src';

const path = {
  build: {
    html: target_folder + '/',
    css: target_folder + '/css/',
    js: target_folder + '/js/',
    img: target_folder + '/img/',
    fonts: target_folder + '/fonts/',
  },
  src: {
    html: source_folder + '/*.html',
    css: source_folder + '/scss/style.scss',
    js: source_folder + '/js/script.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: source_folder + '/fonts/*.ttf',
  },
  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/**/*.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: source_folder + '/fonts/*.ttf',
  },
  clean: './' + target_folder + '/',
}

const {src, dest} = require('gulp');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass')(require('sass'));
const autoPrefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const imageMin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webpHtml = require('gulp-webp-html');
const ttfToWoff = require('gulp-ttf2woff');
const ttfToWoff2 = require('gulp-ttf2woff2');

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + target_folder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(webpHtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css)
    .pipe(scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(groupMedia())
    .pipe(autoPrefixer({
        overrideBrowsersList: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

//todo: Подключить сюда webpack
function js() {
  return src(path.src.js)
    .pipe(fileInclude())
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(webp({
      quality: 70,
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imageMin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      interlaced: true,
      optimizationLevel: 3,
    }))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function clean() {
  return del(path.clean);
}

function fonts() {
  return src(path.src.fonts)
    .pipe(ttfToWoff())
    .pipe(dest(path.build.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttfToWoff2())
    .pipe(dest(path.build.fonts))
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.default = watch;
