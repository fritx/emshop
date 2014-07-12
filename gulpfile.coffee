path = require 'path'
gulp = require 'gulp'
coffee = require 'gulp-coffee'
less = require 'gulp-less'
jade = require 'gulp-jade'
livereload = require 'gulp-livereload'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'
cssmin = require 'gulp-cssmin'
rename = require 'gulp-rename'
data = require 'gulp-data'
modify = require 'gulp-modify'
rimraf = require 'gulp-rimraf'

module.exports = gulp
apiType = 'node'
locals = require './locals.json'

# pack

gulp.task 'pack:js', ->
  gulp.src [
      'bower_components/underscore/underscore.js'
      'bower_components/async/lib/async.js'
      'bower_components/store.js/store.js'
      'bower_components/zeptojs/src/zepto.js'
      'bower_components/zeptojs/src/event.js'
      'bower_components/zeptojs/src/ajax.js'
      'bower_components/zeptojs/src/form.js'
      'bower_components/zeptojs/src/ie.js'
      'bower_components/zeptojs/src/fx.js'
      'bower_components/zeptojs/src/fx_methods.js'
      'bower_components/zeptojs/src/selector.js'
      'bower_components/alertify.js/lib/alertify.js'
      'bower_components/jade/runtime.js'
      # fake jquery for some deps
      'src/js/as-jquery.js'
      'bower_components/jquery.lazyload/jquery.lazyload.js'
    ]
    .pipe concat '_deps.js', newLine: ';'
    .pipe uglify()
    .pipe gulp.dest 'dist/js'

gulp.task 'pack:css', ->
  gulp.src [
      'bower_components/fontawesome/css/font-awesome.css'
      'bower_components/pure/base.css'
      'bower_components/pure/forms-nr.css'
      'bower_components/pure/grids-nr.css'
      'bower_components/pure/menus-core.css'
      'bower_components/alertify.js/themes/alertify.core.css'
      'bower_components/alertify.js/themes/alertify.default.css'
    ]
    .pipe concat '_deps.css'
    .pipe cssmin()
    .pipe gulp.dest 'dist/css'

gulp.task 'pack:assets', ->
  gulp.src 'bower_components/fontawesome/fonts/**'
    .pipe gulp.dest 'dist/fonts'
  gulp.src 'assets/**'
    .pipe gulp.dest 'dist'

gulp.task 'pack:content', ->
  gulp.src [
      'content/**'
    ]
    .pipe gulp.dest 'dist/content'

gulp.task 'pack', [
  'pack:js', 'pack:css', 'pack:assets', 'pack:content'
]

# css

gulp.task 'css:site', ->
  gulp.src [
    'src/less/main.less'
  ]
  .pipe concat('_site.css')
  .pipe less()
  .pipe cssmin()
  .pipe gulp.dest 'dist/css'

gulp.task 'css:parts', ->
  gulp.src 'src/less/parts/*.less'
  .pipe less()
  .pipe cssmin()
  .pipe gulp.dest 'dist/css/parts'

gulp.task 'css', ['css:site', 'css:parts']

# html

gulp.task 'html:parts', ->
  gulp.src [
    'src/jade/parts/*.jade'
    '!**/*-.jade'
  ]
  .pipe data (file, cb)->
    name = path.basename file.path, '.jade'
    cb
      meta: locals.meta
      name: name
  .pipe jade()
  .pipe rename (path)->
    path.dirname = path.basename
    path.basename = 'index'
    return
  .pipe gulp.dest 'dist'

gulp.task 'html:index', ->
  gulp.src 'src/jade/index.jade'
  .pipe jade
    data:
      meta: locals.meta
  .pipe gulp.dest 'dist'

gulp.task 'html', ['html:parts', 'html:index']

# js

gulp.task 'js:site', ->
  gulp.src [
    "src/js/api/#{apiType}.js"
    'src/js/main.js'
  ]
  .pipe concat '_site.js', newLine: ';'
  .pipe uglify()
  .pipe gulp.dest 'dist/js'

gulp.task 'js:parts', ->
  gulp.src 'src/js/parts/*.js'
  .pipe uglify()
  .pipe gulp.dest 'dist/js/parts'

gulp.task 'js:jst', ->
  gulp.src [
    'src/jade/jst/*.jade'
    '!**/*-.jade'
  ]
  .pipe jade
    client: true
    processName: (file)->
      path.basename file, '.jade'
  # hack for jst namespace
  .pipe modify
    fileModifier: (file, contents)->
      name = path.basename file.path, '.js'
      contents.replace /^function template\(/,
        "JST['#{name}']=function("
  .pipe concat 'jst.js', newLine: ';'
  .pipe modify
    fileModifier: (file, contents)->
      'var JST={};' + contents
  .pipe uglify()
  .pipe gulp.dest 'dist/js'

gulp.task 'js', ['js:site', 'js:parts', 'js:jst']

# general

gulp.task 'clean', ->
  gulp.src 'dist', read: false
  .pipe rimraf()

gulp.task 'client', ['pack', 'html', 'css', 'js']

gulp.task 'dev', ->
  gulp.watch 'src/jade/**', ['html', 'js']
  gulp.watch 'src/less/**', ['css']
  gulp.watch 'src/js/**', ['js']
  gulp.watch 'dist/**'
  .on 'change', livereload.changed
  livereload.listen()
  require './server'

gulp.task 'default', ['dev']