var gulp       = require('gulp'),
    changed    = require('gulp-changed'),
    typescript = require('gulp-tsc');

gulp.task('default', ['typescript', 'watch']);

gulp.task('typescript', function () {
    gulp.src('src/**/*.ts')
        .pipe(changed('app/js'))
        .pipe(typescript({ emitError: false }))
        .pipe(gulp.dest('app/js'))
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', [ 'typescript' ])
});
