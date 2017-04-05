var gulp = require('gulp');
var sass = require('gulp-sass');
var coffee = require('gulp-coffee');
var jade = require('gulp-jade');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var webserver = require('gulp-webserver');
var livereload = require('gulp-livereload');
var cache = require('gulp-cached');
var jadeInheritance = require('gulp-jade-inheritance');
var fs=require('fs');

var paths = {
  app: 'app',
  dist: 'dist',
  jade: ['app/partials/**/*.jade'],
  index: 'app/index.jade',
  asset: ['app/assets/**/*'],
  stylesMain: [
      'app/styles/entry.scss'
  ],
  styles: 'app/styles/**/*.scss',
  js: ['app/js/index.js', 'app/js/base.js','app/js/**/*.js'],
  jsLibs: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/jquery-ui/jquery-ui.js',
    'bower_components/angular/angular.js',
    'bower_components/lodash/dist/lodash.js',
    'bower_components/moment/moment.js',
    'bower_components/moment/locale/zh-cn.js',
    'bower_components/d3/d3.min.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-aria/angular-aria.js',
    'bower_components/angular-material/angular-material.js',
    'bower_components/angular-bootstrap/ui-bootstrap.js',
    'bower_components/angular-ui-date/dist/date.js',
    'bower_components/angular-ui-select/dist/select.js',
    'bower_components/zTree/js/jquery.ztree.core.min.js',
    'bower_components/zTree/js/jquery.ztree.excheck.min.js',
    'node_modules/angular-messages/angular-messages.min.js',
    'bower_components/restangular/dist/restangular.min.js',
    'bower_components/angular-sanitize/angular-sanitize.js'
  ]
}

gulp.task('clean', function() {
    return gulp.src(paths.dist)
        .pipe(clean());
});

gulp.task('copy', function() {
    return gulp.src(paths.asset)
        .pipe(gulp.dest(paths.dist + '/assets'));
})

gulp.task('index-deploy', function() {
    return gulp.src(paths.index)
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('jade-deploy', function() {
    return gulp.src(paths.jade)
        .pipe(plumber())
        .pipe(jadeInheritance({basedir: './app/pages'}))
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(paths.dist + '/pages'));
});

gulp.task('sass-deploy', function() {
    return gulp.src(paths.stylesMain)
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest(paths.dist + '/styles'));
});

gulp.task('js-deploy', function() {
    return gulp.src(paths.js)
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.dist + '/js'));
});

gulp.task('jsLibs-deploy', function() {
    return gulp.src(paths.jsLibs)
        .pipe(plumber())
        .pipe(concat('libs.js'))
        .pipe(gulp.dest(paths.dist + '/js'));
});


_apiFiles = {
  '/api/orders' : 'test.json',
  '/api/orders/1' : 'test_1.json',
  '/api/taskview' : 'taskview.json',
  '/api/task_distribute/task_zTree' : 'task_distribute_task_zTree.json',
  '/api/task_distribute/task_zTree_right' : 'task_distribute_task_rightTree.json',
  '/api/task_distribute/task_root' : 'task_distribute_task_roots.json',
  '/api/task_distribute/task_level' : 'task_distribute_task_levels.json',
  '/api/task_break_down/plans': 'task_break_down_plans.json',
  '/api/task_break_down/plans/1': 'task_break_down_plans1.json',
  '/api/task_break_down/plans_tree/1': 'task_break_down_plan_tree1.json',
  '/api/task_break_down/plans_schemes': 'task_break_down_plan_schemes.json',
  '/api/task_break_down/plans_tasks': 'task_break_down_plan_tasks.json',
  '/api/task_break_down/plans_alocationSchemes': 'task_break_down_plan_alocationSchemes.json',
  '/api/organization' : 'organization.json'

}


function dispatchApiData(req, res, next){
  if(_apiFiles[req.url]){
    var data = JSON.parse(fs.readFileSync('app/assets/json/'+_apiFiles[req.url]));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }
  next();
}

gulp.task('webserver', function() {
    return gulp.src(paths.dist)
        .pipe(webserver({
            livereload: true,
            open: false,
            port: 5000,
            middleware: dispatchApiData
        }));
});



// watch任务要分开执行，否则新建文件时不能触发重新编译
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(paths.jade, ['jade-deploy', 'index-deploy']);
    gulp.watch("app/index.jade", ['index-deploy']);
    gulp.watch([paths.stylesMain, paths.styles], ['sass-deploy']);
    gulp.watch(paths.js, ['js-deploy']);
    gulp.watch(paths.assets, ['copy']);

    return gulp.watch([
        "dist/js/app.js","dist/styles/entry.css", "dist/index.html", "dist/pages/**/*.html"])
        .on("change",livereload.changed);
});

gulp.task('default', function() {
    runSequence(
        'clean',
        'copy',
        [
            'index-deploy',
            'jade-deploy',
            'sass-deploy',
            'js-deploy',
            'jsLibs-deploy'
        ],
        'webserver',
        'watch'
        );
});









