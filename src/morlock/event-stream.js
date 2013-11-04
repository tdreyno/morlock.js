import {
  variadic,
  throttle,
  delay,
  map,
  push,
  apply,
  delay,
  unshift,
  eventListener
} from "morlock/util";

function makeStream() {
  var value;
  var subscribers = [];

  return {
    emit: function(v) {
      map(function(s) {
        s(v);
      }, subscribers);

      value = v;
    },

    val: function() {
      return value;
    },

    onValue: function(cb) {
      subscribers.push(cb);
    }
  };
}

function eventStream(target, eventName) {
  var outputStream = makeStream();
  eventListener(target, eventName, outputStream.emit);
  return outputStream;
}

var mergeStreams = variadic(function(args) {
  var outputStream = makeStream();

  map(function(s) {
    s.onValue(outputStream.emit);
  }, args);

  return outputStream;
});

var bindStream = variadic(function(stream, f, args) {
  var outputStream = makeStream();
  
  stream.onValue(function(v) {
    apply(f, unshift(args, function() {
      outputStream.emit(v);
    }));
  });

  return outputStream;
});

function delayStream(stream, ms) {
  return bindStream(stream, delay, ms);
}

function throttleStream(stream, ms) {
  var outputStream = makeStream();
  stream.onValue(throttle(outputStream.emit, ms));
  return outputStream;
}

function mapStream(f, stream) {
  var outputStream = makeStream();
  
  stream.onValue(function(v) {
    outputStream.emit(f(v));
  });

  return outputStream;
}

function filterStream(f, stream) {
  var outputStream = makeStream();
  
  stream.onValue(function(v) {
    if (f(v)) {
      outputStream.emit(v);
    }
  });

  return outputStream;
}

export {
  makeStream,
  eventStream,
  delayStream,
  throttleStream,
  mapStream,
  mergeStreams,
  filterStream
}
