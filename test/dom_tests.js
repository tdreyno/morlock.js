define('test/dom_tests', ['morlock/core/dom'], function(util) {

  describe("DOM tests", function(){

    specify("getViewportWidth", function(){
      var width = util.getViewportWidth();
      assert.equal(width, window.innerWidth, 'PhantomJS window width');
    });

    specify("getViewportHeight", function(){
      var height = util.getViewportHeight();
      assert.equal(height, window.innerHeight, 'PhantomJS window height');
    });

    specify("testMQ", function(){
      var max = window.innerWidth + 100;
      var min = window.innerWidth - 100;
      assert.ok(util.testMQ('(max-width:' + max + 'px)'), 'Test max-width');
      assert.ok(!util.testMQ('(min-width:' + max + 'px)'), 'Test min-width');
      assert.ok(util.testMQ('(min-width:' + min + 'px) and (max-width:' + max + 'px)'), 'Test combo');
    });

    specify("getRect", function() {
      var elem = document.getElementById('box');

      var rect = util.getRect(elem);
      assert.deepEqual(rect, {
        right: 200,
        left: 100,
        bottom: 200,
        top: 100,
        width: 100,
        height: 100
      }, 'Box location');

      var rectWithBuff = util.getRect(elem, 10);
      assert.deepEqual(rectWithBuff, {
        right: 210,
        left: 90,
        bottom: 210,
        top: 90,
        width: 120,
        height: 120
      }, 'Box location with buffer');
    });

  });
});