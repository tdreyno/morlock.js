import { variadic, throttle, delay, map, push, apply, delay, unshift,
         eventListener, compose, when, partial,
         debounce, once } from "morlock/core/util";

var nextID = 0;

function makeStream() {
  var value; // TODO: Some kind of buffer
  var subscribers = [];
  var subscriberSubscribers = [];
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

    onSubscription: function onValue(cb) {
      subscriberSubscribers.push(cb);
    },

    onValue: function onValue(cb) {
      subscribers.push(cb);

      map(function(s) {
        return s(cb);
      }, subscriberSubscribers);
    }
  };
}

function onValue(f, stream) {
  stream.onValue(f);
}

function onSubscription(f, stream) {
  stream.onSubscription(f);
}

function eventStream(target, eventName) {
  var outputStream = makeStream();

  /**
   * Lazily subscribes to a dom event.
   */
  var attachListener = partial(eventListener, target, eventName, outputStream.emit);
  onSubscription(once(attachListener), outputStream);

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

function debounceStream(ms, stream) {
  var outputStream = makeStream();
  stream.onValue(debounce(outputStream.emit, ms));
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
         mergeStreams, filterStream, debounceStream }
