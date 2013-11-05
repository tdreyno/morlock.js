import { variadic, throttle, delay, map, push, apply, delay, unshift,
         eventListener, compose, when, partial } from "morlock/util";

var nextID = 0;

function makeStream() {
  var value; // TODO: Some kind of buffer
  var subscribers = [];
  var streamID = nextID++;

  return {
    emit: function emit(v) {
      map(function(s) {
        return s(v);
      }, subscribers);

      value = v;
    },

    val: function val() {
      return value;
    },

    onValue: function onValue(cb) {
      subscribers.push(cb);
    }
  };
}

function onValue(f, stream) {
  stream.onValue(f);
}

function eventStream(target, eventName) {
  var outputStream = makeStream();
  eventListener(target, eventName, outputStream.emit);
  return outputStream;
}

var mergeStreams = variadic(function mergeStreams(args) {
  var outputStream = makeStream();
  map(partial(onValue, outputStream.emit), args);
  return outputStream;
});

function delayStream(ms, stream) {
  var outputStream = makeStream();
  stream.onValue(delay(outputStream.emit, ms));
  return outputStream;
}

function throttleStream(ms, stream) {
  var outputStream = makeStream();
  stream.onValue(throttle(outputStream.emit, ms));
  return outputStream;
}

function mapStream(f, stream) {
  var outputStream = makeStream();
  stream.onValue(compose(outputStream.emit, f));
  return outputStream;
}


function filterStream(f, stream) {
  var outputStream = makeStream();
  stream.onValue(when(f, outputStream.emit));
  return outputStream;
}

export { makeStream, eventStream, delayStream, throttleStream, mapStream,
         mergeStreams, filterStream }
