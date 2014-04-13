var gulp       = require('gulp'),
    changed    = require('gulp-changed'),
    typescript = require('gulp-tsc'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream'),
    es         = require('event-stream');

gulp.task('default', ['browserify', 'watch']);

gulp.task('typescript', function () {
    return gulp.src('src/**/*.ts')
        .pipe(changed('src/js'))
        .pipe(typescript({ emitError: false }))
        .pipe(gulp.dest('src/js'))
});

gulp.task('browserify', ['typescript'], function () {
    return es.merge.apply(es,
        [ 'bg/background.js', 'inject/inject.js', 'options/options.js' ].map(
            function (path) {
                return browserify('./src/js/' + path)
                    .bundle()
                    .pipe(source(path))
                    .pipe(gulp.dest('app/js'));
            }
        )
    );
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', [ 'browserify' ])
});
