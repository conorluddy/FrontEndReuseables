'use strict';

var data = require('gulp-data');
var filesize = require('filesize');
var fs = require('fs');
var notify = require('gulp-notify');


module.exports = function (gulp) {

  /**
   * Notify us of the CSS file size
   * 
   * Time this to only kick off after CSS has been created
   * check your gulp console for task completion time.
   * Give it enough of a delay to allow the CSS to be created first,
   * so you're not getting the filesize from before the updates.
   * Triggered from SASS build task so that it runs before and after it.
   */
  gulp.task('notify-css-size', function () {
    var notificationDelay = 3000;
    var oldFileSize = 0;

    setTimeout(function() {
      gulp.src(['./public/css/styles.css'])
        .pipe(notify(function(file) {

          var cssStatusFace = '\o/';
          var FS = file.stat ? file.stat.size : Buffer.byteLength(String(file.contents));
          var sizeDiff = FS - oldFileSize;

          //Get more depressed as it grows :)
          if (FS > 30000) cssStatusFace = ':D';
          if (FS > 40000) cssStatusFace = ':)';
          if (FS > 50000) cssStatusFace = ':|';
          if (FS > 60000) cssStatusFace = ':/';
          if (FS > 70000) cssStatusFace = ':(';
          if (FS > 80000) cssStatusFace = ':\'(';
          if (FS > 90000) cssStatusFace = '>:(';

          var sizeMsg = 'CSS ' + cssStatusFace + ' ' + filesize(FS) + '  (Diff: ' + filesize(sizeDiff) + ')';

          return sizeMsg;
      }));
    }, notificationDelay);


    /**
     * Simplified file size check for minified version
     */
    setTimeout(function() {
      gulp.src(['./public/css/styles.min.css'])
        .pipe(notify(function(file) {
          var FS = file.stat ? file.stat.size : Buffer.byteLength(String(file.contents));
          return 'Minified CSS size = ' + filesize(FS);
        }));
    }, notificationDelay + 4000);

    /**
     * This runs first, then previous chunk runs after x seconds.
     * That way we can still return. 
     * Handiest way to save the size of the existing file...
     */
    return gulp.src(['./public/css/styles.css'])
      .pipe(notify(function(file) {
        oldFileSize = file.stat ? file.stat.size : Buffer.byteLength(String(file.contents));
        return false;
      }));

  });



})(this.window, this.document, this.APP, jQuery, Modernizr);
