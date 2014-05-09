var gulp       = require('gulp'),
    changed    = require('gulp-changed'),
    typescript = require('gulp-tsc'),
    zip        = require('gulp-zip'),
    editJson   = require('gulp-json-editor'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream'),
    es         = require('event-stream'),
    exec       = require('child_process').exec,
    Q          = require('q');

gulp.task('default', ['build']);

gulp.task('typescript', function () {
    return gulp.src('src/**/*.ts')
        .pipe(changed('src/js'))
        .pipe(typescript({ emitError: false }))
        .pipe(gulp.dest('src/js'));
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

function tag (options) {
    var q = Q.defer();

    exec('git describe --tags --always ' + (options || ''), function (err, stdout, stderr) {
        if (err) {
            q.reject(err)
            return;
        }

        var tag = stdout.replace(/\n/, '');
        q.resolve(tag);
    });

    return q.promise;
}

gulp.task('manifest', function () {
    return tag().then(function (tag) {
        return gulp.src('src/manifest.json')
            .pipe(editJson({ version: tag.replace(/-(\d+)-.*/g, '.$1') }))
            .pipe(gulp.dest('app/'));
    });
});

gulp.task('build', ['manifest', 'browserify', 'copy']);

gulp.task('zip', ['build'], function (cb) {
    return tag('--dirty').then(function (tag) {
        return gulp.src('app/**/*')
            .pipe(zip('Flavoured-Favicon-' + tag + '.zip'))
            .pipe(gulp.dest('build'));
    });
})

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', ['browserify'])
});
