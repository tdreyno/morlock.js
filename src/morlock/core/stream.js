import { variadic, throttle, delay, map, push, apply, delay, unshift,
         eventListener, compose, when, partial,
         debounce, once } from "morlock/core/util";

var nextID = 0;

function makeStream(trackSubscribers) {
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
      if (trackSubscribers) {
        subscriberSubscribers.push(cb);
      }
    },

    onValue: function onValue(cb) {
      subscribers.push(cb);

      if (trackSubscribers) {
        map(function(s) {
          return s(cb);
        }, subscriberSubscribers);
      }
    }
  };
}

function streamEmit(stream, val) {
  return stream.emit(val);
}

function streamValue(stream) {
  return stream.val();
}

function onValue(f, stream) {
  return stream.onValue(f);
}

function onSubscription(f, stream) {
  return stream.onSubscription(f);
}

function eventStream(target, eventName) {
  var outputStream = makeStream(true);

  /**
   * Lazily subscribes to a dom event.
   */
  var attachListener = partial(eventListener, target, eventName, outputStream.emit);
  onSubscription(once(attachListener), outputStream);

  return outputStream;
}

function timeoutStream(ms) {
  var outputStream = makeStream(true);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = partial(setInterval, outputStream.emit, ms);
  onSubscription(once(attachListener), outputStream);

  return outputStream;
}

function requestAnimationFrameStream() {
  var outputStream = makeStream(true);

  /**
   * Lazily subscribes to a raf event.
   */
  function sendEvent(t) {
    outputStream.emit(t);
    requestAnimationFrame(sendEvent);
  }

  onSubscription(once(sendEvent), outputStream);

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
  var f = ms > 0 ? throttle(outputStream.emit, ms) : outputStream.emit;
  stream.onValue(f);
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

function sampleStream(sourceStream, sampleStream) {
  var outputStream = makeStream();
  sampleStream.onValue(compose(outputStream.emit, sourceStream.val));
  return outputStream;
}

export { makeStream, eventStream, delayStream, throttleStream, mapStream,
         mergeStreams, filterStream, debounceStream, sampleStream, timeoutStream,
         requestAnimationFrameStream }
