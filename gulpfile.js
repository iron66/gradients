var gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  notify = require('gulp-notify'),
  multipipe = require('multipipe'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync').create();

gulp.task('sass', function() {
  return multipipe(
    gulp.src('styles/sass/style.scss'),
    sourcemaps.init(),
    sass(),
    autoprefixer('last 2 versions', 'safari 5', 'ie6', 'ie7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'),
    sourcemaps.write('.'),
    gulp.dest('styles/css')
  ).on('error', notify.onError());
});

gulp.task('server', function () {
  browserSync.init({
    server: '.'
  });
  browserSync.watch(['styles/css/*.css', 'index.html']).on('change', browserSync.reload);
});

gulp.task('watch:sass', function() {
  gulp.watch('styles/sass/**/*.scss', gulp.series('sass'));
});

gulp.task('dev', gulp.parallel('watch:sass', 'server'));