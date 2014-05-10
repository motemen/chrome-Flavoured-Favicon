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
        .pipe(changed('src/js', { extension: '.js' }))
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

function tag () {
    var q = Q.defer();

    exec('git describe --tags --always --dirty', function (err, stdout, stderr) {
        if (err) {
            q.reject(err)
            return;
        }

        var tag = stdout.replace(/\n/, '');
        q.resolve(tag);
    });

    return q.promise;
}

function version () {
    return tag().then(function (tag) {
        return tag.replace(/^(\d+\.\d+)(?:-(\d+))?/, function (_, majorMinor, patch) {
                return majorMinor + '.' + (patch || '0');
            })
            .replace(/-g[0-9a-f]+/, '')
            .replace(/-dirty/, '.1');
    });
}

gulp.task('manifest', function () {
    return version().then(function (version) {
        return gulp.src('src/manifest.json')
            .pipe(editJson({ version: version }))
            .pipe(gulp.dest('app/'));
    });
});

gulp.task('build', ['manifest', 'browserify', 'copy']);

gulp.task('zip', ['build'], function (cb) {
    return version().then(function (version) {
        return gulp.src('app/**/*')
            .pipe(zip('Flavoured-Favicon-' + version + '.zip'))
            .pipe(gulp.dest('build'));
    });
})

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', ['browserify'])
});
