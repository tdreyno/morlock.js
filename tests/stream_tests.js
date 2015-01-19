var assert = require('assert');
var Stream = require('../core/stream');

describe('Stream tests', function(){

  specify('basics', function(){
    var s = Stream.create();

    Stream.onValue(s, function(v) {
      assert.equal(v, 'Hello', 'Matching data1');
    });

    Stream.onValue(s, function(v) {
      assert.equal(v, 'Hello', 'Matching data2');
    });

    Stream.emit(s, 'Hello');
  });

  specify('subscriber callback', function(done){
    var s = Stream.create(true);

    Stream.onSubscription(s, function() {
      assert.ok('Got a subscriber!');
      done();
    });

    Stream.onValue(s, function(v) {
      assert.equal(v, 'Hello', 'Matching data1');
    });
  });

  specify('interval', function(done) {
    this.timeout(1000);

    var counter = 0;

    var s = Stream.interval(100);
    Stream.onValue(s, function() {
      counter++;
    });

    setTimeout(function() {
      assert.equal(counter, 4, 'Called 4 times');
      done();
    }, 450);
  });

  specify('timeout', function(done) {
    this.timeout(300);

    var counter = 0;

    var s = Stream.timeout(100);
    Stream.onValue(s, function() {
      counter++;
    });

    setTimeout(function() {
      assert.equal(counter, 1, 'Called 1 times');
      done();
    }, 200);
  });

  specify('merging 2 streams', function(done) {
    this.timeout(300);

    var counter = 0;

    var s1 = Stream.timeout(100);
    var s2 = Stream.timeout(100);
    var s3 = Stream.merge(s1, s2);

    Stream.onValue(s3, function() {
      counter++;
    });

    setTimeout(function() {
      assert.equal(counter, 2, 'Called 2 times');
      done();
    }, 200);
  });

  specify('merging 5 streams', function(done) {
    this.timeout(300);

    var counter = 0;

    var s1 = Stream.timeout(100);
    var s2 = Stream.timeout(100);
    var s3 = Stream.timeout(100);
    var s4 = Stream.timeout(100);
    var s5 = Stream.timeout(100);
    var s6 = Stream.merge(s1, s2, s3, s4, s5);

    Stream.onValue(s6, function() {
      counter++;
    });

    setTimeout(function() {
      assert.equal(counter, 5, 'Called 5 times');
      done();
    }, 200);
  });

  specify('delayed streams', function(done) {
    this.timeout(3000);

    var counter = 0;

    var s1 = Stream.create();
    var s2 = Stream.delay(100, s1);

    var time1;
    var time2;

    Stream.onValue(s1, function() {
      time1 = Date.now();
    });

    Stream.onValue(s2, function() {
      time2 = Date.now();

      var diff = time2 - time1;
      assert.equal((diff >= 100) && (diff < 200), true, 'Delayed event by 100ms');
      done();
    });

    Stream.emit(s1, 'hi');
  });

  specify('throttled streams', function(done) {
    this.timeout(1500);

    var value = 0;

    var s = Stream.create();
    var s2 = Stream.throttle(500, s);

    Stream.onValue(s2, function() {
      value++;
    });

    var intervalCount = 0;
    var f = function() {
      if (++intervalCount > 4) {
        clearInterval(intervalKey);

        assert.equal(intervalCount, 5, '4 iterations (800 seconds)');
        assert.equal(value, 2, 'Only ran throttled 2 times');
        done();
      }

      Stream.emit(s, 'hi');
    };
    f();
    var intervalKey = setInterval(f, 200);
  });

  specify('debounce', function(done){
    this.timeout(1000);

    var value = 0;

    var s = Stream.create();
    var s2 = Stream.debounce(100, s);

    Stream.onValue(s2, function() {
      value++;
    });

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

      Stream.emit(s, 'hi');
    }, 10);
  });

  specify('map', function(done) {
    var s = Stream.create();
    var s2 = Stream.map(function(v) {
      return v + 1;
    }, s);

    Stream.onValue(s2, function(v) {
      assert.equal(v, 2, 'incremented value');
      done();
    });

    Stream.emit(s, 1);
  });

  specify('filter', function() {
    var s = Stream.create();
    var s2 = Stream.filter(function(v) {
      return v === 1;
    }, s);

    var counter = 0;
    Stream.onValue(s2, function() {
      counter++;
    });

    Stream.emit(s, 1);
    Stream.emit(s, 2);
    Stream.emit(s, 3);
    Stream.emit(s, 1);


    assert.equal(counter, 2, 'called twice');
  });

  specify('sample', function(done) {
    this.timeout(1500);

    var s = Stream.interval(100);
    var s2 = Stream.interval(400);
    var s3 = Stream.sample(s, s2);

    var counter = 0;

    Stream.onValue(s3, function(v) {
      counter++;
    });

    setTimeout(function() {
      assert.equal(counter, 2, 'Called 2 times');
      done();
    }, 1000);
  });
});
