casper.test.comment('Resize stream');

var currentFile = require('system').args[3];
var curFilePath = fs.absolute(currentFile);
var htmlPath = 'file://' + curFilePath + '/casperjs/resize_stream_tests.html';

casper.start(htmlPath);

casper.then(function() {
  var info = this.getElementInfo('#output');
  this.test.assertEqual(info.html, 'Ready', 'Output is Ready');
});

casper.viewport(1024, 768).then(function() {
  this.evaluate(function() {
    forceEmit();
  });

  var info = this.getElementInfo('#output');
  this.test.assertEqual(info.html, '1024x768', 'Output is 1024x768');
});

casper.wait(100, function() {
  this.viewport(768, 1024).then(function() {
    this.evaluate(function() {
      forceEmit();
    });

    var info = this.getElementInfo('#output');
    this.test.assertEqual(info.html, '768x1024', 'Output is 768x1024');
  });
});

casper.run(function() {
  this.test.done();
});