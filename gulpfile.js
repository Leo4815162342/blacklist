var gulp = require('gulp'),
    sass = require('gulp-sass'),
    csscomb = require('gulp-csscomb'),
    autoprefixer = require('gulp-autoprefixer'),
    connect = require('gulp-connect'),
    combineMq = require('gulp-combine-mq'),
    babel = require('gulp-babel');

gulp.task('styles', function () {
  gulp.src('./scss/main.scss')
    .pipe(sass({
      includePaths: ['./scss'],
      outputStyle: 'compressed' // 'expanded' for non-compressed version;
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
    .pipe(combineMq({
      beautify: true
    }))
    .pipe(gulp.dest('css/'));
});

gulp.task('babel', function () {
  return gulp.src('js/app.js')
    .pipe(babel())
    .pipe(gulp.dest('js/compiled'));
});

gulp.task('watch', function () {
  gulp.watch('./scss/**/*.scss', ['styles']);
  gulp.watch('./js/app.js', ['babel']);
});

gulp.task('connect', function() {
  connect.server();
});

gulp.task('default', ['connect', 'watch']);

