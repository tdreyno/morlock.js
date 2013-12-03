define('test/util_tests', ['morlock/core/util'], function(util) {

  describe("Util tests", function(){

    specify("slice", function(){
      var a = ['1', '2', '3'];
      var b = util.slice(a, 1);
      assert.deepEqual(a, ['1', '2', '3'], "Original array should be unchanged");
      assert.deepEqual(b, ['2', '3'], "New array should be: ['2', '3']");
    });

    specify("copyArray", function(){
      var a = [2, 1, 3];
      var b = util.copyArray(a);

      assert.notEqual(a, b, "Not the same objects");

      b.sort();

      assert.deepEqual(a, [2, 1, 3], "Original array should be unchanged");
      assert.deepEqual(b, [1, 2, 3], "New array should be sorted");
    });

    specify("indexOf", function(){
      var a = [2, 1, 3];
      var idx = util.indexOf(a, 3);

      assert.equal(idx, 2, "Found item in array");
    });

    specify("throttle", function(done){
      this.timeout(1000);

      var value = 0;

      var fn = function() {
        value++;
      };

      var throttledFn = util.throttle(fn, 100);

      var intervalCount = 0;
      var intervalKey = setInterval(function() {
        if (++intervalCount > 55) {
          clearInterval(intervalKey);

          assert.equal(intervalCount, 56, "55 iterations (550 seconds)");
          assert.equal(value, 6, "Only ran throttled 6 times");
          done();
        }

        throttledFn();
      }, 10);
    });

    specify("debounce", function(done){
      this.timeout(1000);

      var value = 0;

      var fn = function() {
        value++;
      };

      var debouncedFn = util.debounce(fn, 100);

      var intervalCount = 0;
      var intervalKey = setInterval(function() {
        if (++intervalCount > 55) {
          clearInterval(intervalKey);

          assert.equal(intervalCount, 56, "55 iterations (550 seconds)");
          setTimeout(function() {
            assert.equal(value, 1, "Only ran debounced 1 time");
            done();
          }, 200);
        }

        debouncedFn();
      }, 10);
    });

  });
});