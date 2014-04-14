var gulp       = require('gulp'),
    changed    = require('gulp-changed'),
    typescript = require('gulp-tsc'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream'),
    es         = require('event-stream'),
    zip        = require('gulp-zip'),
    exec       = require('child_process').exec,
    Q          = require('q');

gulp.task('default', ['browserify', 'copy', 'watch']);

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

gulp.task('copy', function () {
    return gulp.src('bower_components/angular/angular.min.js')
        .pipe(gulp.dest('app/js/lib'))
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', [ 'browserify' ])
});

gulp.task('zip', function (cb) {
    var q = Q.defer();

    exec('git describe --tags --always --dirty', function (err, stdout, stderr) {
        if (err) {
            q.reject(err)
            return;
        }

        var tag = stdout.replace(/\n/, '');
        gulp.src('app/**/*')
            .pipe(zip('Flavoured-Favicon-' + tag + '.zip'))
            .pipe(gulp.dest('build'))
            .on('end', function () {
                q.resolve();
            });
    });

    return q.promise;
})
