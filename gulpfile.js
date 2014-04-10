var gulp       = require('gulp'),
    typescript = require('gulp-tsc');

gulp.task('default', ['typescript', 'watch']);

gulp.task('typescript', function () {
    gulp.src('src/**/*.ts')
        .pipe(typescript())
        .pipe(gulp.dest('app/js'))
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', [ 'typescript' ])
});
