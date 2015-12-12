var gulp = require('gulp'),
	sass = require('gulp-sass'),
  csscomb = require('gulp-csscomb'),
	autoprefixer = require('gulp-autoprefixer'),
  connect = require('gulp-connect'),
  cmq = require('gulp-combine-media-queries');
 
gulp.task('styles', function () {
  gulp.src('./scss/main.scss')
    .pipe(sass({
      includePaths: ['./scss'],
      outputStyle: 'compressed' //'expanded' for non-compressed version
    }))
    .pipe(autoprefixer({
            browsers: [
              'last 2 versions',
              'safari 5',
              'ie 8',
              'ie 9',
              'opera 12.1',
              'ios 6',
              'android 4'
            ],
            cascade: false
        }))
    .pipe(csscomb())
    .pipe(cmq({
      log: true
    }))
    .pipe(gulp.dest('css/'));
});

gulp.task('watch', function () {
  gulp.watch('./scss/**/*.scss', ['styles']);
});

gulp.task('connect', function() {
  connect.server();
});

gulp.task('default', ['connect','watch']);

