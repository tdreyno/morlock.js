var assert = require('assert');
var util = require('core/util');

describe('Util tests', function(){

  specify('slice', function(){
    var a = ['1', '2', '3'];
    var b = util.slice(a, 1);
    assert.deepEqual(a, ['1', '2', '3'], 'Original array should be unchanged');
    assert.deepEqual(b, ['2', '3'], 'New array should be: ["2", "3"]');
  });

  specify('copyArray', function(){
    var a = [2, 1, 3];
    var b = util.copyArray(a);

    assert.notEqual(a, b, 'Not the same objects');

    b.sort();

    assert.deepEqual(a, [2, 1, 3], 'Original array should be unchanged');
    assert.deepEqual(b, [1, 2, 3], 'New array should be sorted');
  });

  specify('indexOf', function(){
    var a = [2, 1, 3];
    var idx = util.indexOf(a, 3);

    assert.equal(idx, 2, 'Found item in array');
  });

  specify('throttle', function(done){
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

        assert.equal(intervalCount, 56, '55 iterations (550 seconds)');
        assert.equal(value, 6, 'Only ran throttled 6 times');
        done();
      }

      throttledFn();
    }, 10);
  });

  specify('debounce', function(done){
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

        assert.equal(intervalCount, 56, '55 iterations (550 seconds)');
        setTimeout(function() {
          assert.equal(value, 1, 'Only ran debounced 1 time');
          done();
        }, 200);
      }

      debouncedFn();
    }, 10);
  });

  specify('mapObject', function() {
    var obj = { one: 1, two: 2, three: 3 };
    var newObj = util.mapObject(function(v) {
      return v + 1;
    }, obj);

    assert.deepEqual(obj, { one: 1, two: 2, three: 3 }, 'Original obj should be unchanged');
    assert.deepEqual(newObj, { one: 2, two: 3, three: 4 }, 'New obj should be incremented');
  });

  specify('map', function() {
    var arr = [1, 2, 3];
    var newArr = util.map(function(v) {
      return v + 1;
    }, arr);

    assert.deepEqual(arr, [1, 2, 3], 'Original arr should be unchanged');
    assert.deepEqual(newArr, [2, 3, 4], 'New arr should be incremented');
  });

  specify('map', function() {
    var arr = [1, 2, 3];
    var newArr = util.map(function(v) {
      return v + 1;
    }, arr);

    assert.deepEqual(arr, [1, 2, 3], 'Original arr should be unchanged');
    assert.deepEqual(newArr, [2, 3, 4], 'New arr should be incremented');
  });

  specify('objectKeys', function() {
    var obj = { one: 1, two: 2, three: 3 };
    var keys = util.objectKeys(obj).sort();

    assert.deepEqual(keys, ['one', 'three', 'two'], 'An array of key names');
  });

  specify('get', function() {
    var obj = { one: 1, two: 2, three: 3 };
    var one = util.get(obj, 'one');

    assert.equal(one, 1, 'Got a key');
  });

  specify('set', function() {
    var obj = { one: 1, two: 2, three: 3 };
    util.set(obj, 'one', 2);

    assert.equal(obj.one, 2, 'Set a key');
  });

  specify('flip', function() {
    var concat = function(a, b) { return a + ' ' + b; };
    var flippedConcat = util.flip(concat);

    assert.equal(concat(1, 2), '1 2', 'Normal concat');
    assert.equal(flippedConcat(1, 2), '2 1', 'Flipped concat');
  });

  specify('isEmpty', function() {
    assert.equal(util.isEmpty([]), true, 'Empty array');
    assert.equal(util.isEmpty([1]), false, 'Non-empty array');
  });

  specify('objectVals', function() {
    var obj = { one: 1, two: 2, three: 3 };
    var vals = util.objectVals(obj).sort();

    assert.deepEqual(vals, [1, 2, 3], 'An array of key values');
  });

  specify('reduce', function() {
    var count = util.reduce(function(sum, v) {
      return sum + v;
    }, [1, 2, 3], 10);

    assert.equal(count, 16, 'An reduced count');
  });

  specify('select', function() {
    var ones = util.select(function(v) {
      return v === 1;
    }, [1, 2, 1, 3, 1]);

    assert.deepEqual(ones, [1, 1, 1], 'An selected array');
  });

  specify('reject', function() {
    var notOnes = util.reject(function(v) {
      return v === 1;
    }, [1, 2, 1, 3, 1]);

    assert.deepEqual(notOnes, [2, 3], 'An rejected array');
  });

  specify('not', function() {
    assert.equal(util.not(true), false, 'An not true');
  });

  specify('equals', function() {
    assert.equal(util.equals('1', '1'), true, 'A string equals');
    assert.equal(util.equals('1', 1), false, 'A coerced equals');
  });

  specify('when', function() {
    var returnFive = function() { return 5; };

    var alwaysReturnFive = util.when(true, returnFive);
    var neverReturnFive = util.when(false, returnFive);

    assert.equal(alwaysReturnFive(), 5, 'Absolute truth');
    assert.equal(neverReturnFive(), undefined, 'Never truth');

    var test = function(isTrue) { return isTrue; };

    var askIfTrue = util.when(test, returnFive);
    assert.equal(askIfTrue(true), 5, 'Functional truth');
    assert.equal(askIfTrue(false), undefined, 'Never truth');
  });
  
  specify('functionBind', function() {
    var Obj = function(num) {
      this.num = num;
      this.inc = function() {
        this.num++;
      };
    };

    var a = new Obj(5);
    var b = new Obj(10);

    var incB = util.functionBind(a.inc, b);
    incB();

    assert.equal(b.num, 11, 'JS function binding');
  });

  specify('partial', function() {
    var abcs = function(a, b, c) {
      return a + ' ' + b + ' ' + c;
    };

    var bcs = util.partial(abcs, 'A');
    var cs = util.partial(abcs, 'A', 'B');

    assert.equal(bcs('b', 'c'), 'A b c', 'Single args');
    assert.equal(cs('c'), 'A B c', 'Double args');
  });

  specify('delay', function(done) {
    this.timeout(500);

    var num = 0;

    var inc = function() {
      num++;
    };

    var delayedInc = util.delay(inc, 200);
    delayedInc();
    assert.equal(num, 0, 'Still 0');
    setTimeout(function() {
      assert.equal(num, 1, 'Now 1');
      done();
    }, 300);
  });

  specify('defer', function(done) {
    var num = 0;

    var inc = function() {
      num++;
    };

    var deferedInc = util.defer(inc);
    setTimeout(function() {
      assert.equal(num, 1, 'Now 1');
      done();
    }, 50);
  });
  
  specify('apply', function() {
    var name = util.apply(function(f, l) {
      return f + ' ' + l;
    }, ['Bob', 'Dole']);

    assert.equal(name, 'Bob Dole', 'Applied array');
  });

  specify('call', function() {
    var name = util.call(function(f, l) {
      return f + ' ' + l;
    }, 'Bob', 'Dole');

    assert.equal(name, 'Bob Dole', 'Applied args');
  });

  specify('nth', function() {
    var arr = [1,2,3];
    assert.equal(util.nth(1, arr), 2, 'nth 2');
  });

  specify('first', function() {
    var arr = [1,2,3];
    assert.equal(util.first(arr), 1, 'first');
  });

  specify('last', function() {
    var arr = [1,2,3];
    assert.equal(util.last(arr), 3, 'last');
  });

  specify('rest', function() {
    var arr = [1,2,3];
    assert.deepEqual(util.rest(arr), [2,3], 'rest');
  });

  specify('unshift', function() {
    var arr = [1, 2, 3];
    var moar = util.unshift(arr, 0);
    assert.deepEqual(arr, [1, 2, 3], 'Original array should be unchanged');
    assert.deepEqual(moar, [0, 1, 2, 3], 'New array should have a new item');
  });

  specify('shift', function() {
    var arr = [1, 2, 3];
    var rest = util.shift(arr);
    assert.deepEqual(arr, [1, 2, 3], 'Original array should be unchanged');
    assert.deepEqual(rest, [2, 3], 'New array should have 1 less item');
  });

  specify('push', function() {
    var arr = [1, 2, 3];
    var moar = util.push(arr, 4);
    assert.deepEqual(arr, [1, 2, 3], 'Original array should be unchanged');
    assert.deepEqual(moar, [1, 2, 3, 4], 'New array should have a new item');
  });

  specify('pop', function() {
    var arr = [1, 2, 3];
    var rest = util.pop(arr);
    assert.deepEqual(arr, [1, 2, 3], 'Original array should be unchanged');
    assert.deepEqual(rest, [1, 2], 'New array should have 1 less item');
  });

  specify('sortBy', function() {
    var arr = [1, 2, 3];
    var sorted = util.sortBy(arr, function(a, b) {
      return b - a;
    });
    assert.deepEqual(arr, [1, 2, 3], 'Original array should be unchanged');
    assert.deepEqual(sorted, [3, 2, 1], 'New array should be reversed');
  });

  specify('compose', function() {
    var inc = function(a) { return a + 1; };
    var dbl = function(a) { return a * 2; };
    var incAndDouble = util.compose(dbl, inc);

    assert.equal(incAndDouble(1), 4, 'Inc-ed then doubled');
  });

  specify('once', function() {
    var num = 0;

    var inc = function() {
      num++;
    };

    var onlyIncOnce = util.once(inc);
    assert.equal(num, 0, 'Still 0');
    onlyIncOnce();
    assert.equal(num, 1, 'Now 1');
    onlyIncOnce();
    assert.equal(num, 1, 'Still 1');
  });

  specify('parseInteger', function() {
    assert.equal(util.parseInteger('08'), 8, 'Always base 10');
    assert.equal(util.parseInteger('129.5'), 129, 'Always base 10');
    assert.equal(util.parseInteger('5'), 5, 'Always base 10');
  });

});
