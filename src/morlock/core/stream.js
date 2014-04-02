import { eventListener } from "morlock/core/events";
import { debounce as debounceCall,
         throttle as throttleCall,
         delay as delayCall,
         map as mapArray,
         memoize,
         first, apply, compose, when, equals,
         partial, once, copyArray, flip, call, indexOf, rAF } from "morlock/core/util";

// Internal tracking of how many streams have been created.
var nextID = 0;

/**
 * Ghetto Record implementation.
 */
function Stream(trackSubscribers) {
  if (!(this instanceof Stream)) {
    return new Stream(trackSubscribers);
  }

  this.trackSubscribers = !!trackSubscribers;
  this.subscribers = null;
  this.subscriberSubscribers = null;
  this.streamID = nextID++;
  this.value = null; // TODO: Some kind of buffer
  this.closed = false;
}

function create(trackSubscribers) {
  return new Stream(trackSubscribers);
}

function emit(stream, val) {
  if (stream.closed) { return; }

  mapArray(partial(flip(call), val), stream.subscribers);

  stream.value = val;
}

function getValue(stream) {
  return stream.value;
}

function onValue(stream, f) {
  if (stream.closed) { return; }

  stream.subscribers = stream.subscribers || [];
  stream.subscribers.push(f);

  if (stream.trackSubscribers) {
    mapArray(partial(flip(call), f), stream.subscriberSubscribers);
  }
}

export function closeStream(stream) {
  if (stream.closed) { return; }

  stream.closed = true;
  stream.value = null;

  if (stream.subscribers) {
    stream.subscribers.length = 0;
  }
}

function offValue(stream, f) {
  if (stream.subscribers) {
    var idx = indexOf(stream.subscribers, f);
    if (idx !== -1) {
      stream.subscribers.splice(idx, 1);
    }
  }
}

function onSubscription(stream, f) {
  if (stream.trackSubscribers) {
    stream.subscriberSubscribers = stream.subscriberSubscribers || [];
    stream.subscriberSubscribers.push(f);
  }
}

function createFromEvents(target, eventName) {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream);

  /**
   * Lazily subscribes to a dom event.
   */
  var attachListener = partial(eventListener, target, eventName, boundEmit);
  onSubscription(outputStream, once(attachListener));

  return outputStream;
}

function interval(ms) {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = partial(setInterval, boundEmit, ms);
  onSubscription(outputStream, once(attachListener));

  return outputStream;
}

function timeout(ms) {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = partial(setTimeout, boundEmit, ms);
  onSubscription(outputStream, once(attachListener));

  return outputStream;
}

var createFromRAF = memoize(function createFromRAF_() {
  var rAFStream = create(true);
  var boundEmit = partial(emit, rAFStream);

  /**
   * Lazily subscribes to a raf event.
   */
  function sendEvent(t) {
    boundEmit(t);
    rAF(sendEvent);
  }

  onSubscription(rAFStream, once(sendEvent));

  return rAFStream;
});

function merge(/* streams */) {
  var streams = copyArray(arguments);
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  
  mapArray(function(stream) {
    return onValue(stream, boundEmit);
  }, streams);

  return outputStream;
}

var EMIT_KEY = ':e:';

function _duplicateStreamOnEmit(stream, f, args) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  var boundArgs = mapArray(function(v) {
    return v === ':e:' ? boundEmit : v;
  }, args);
  onValue(stream, apply(apply, [f, boundArgs]));
  return outputStream;
}

function delay(ms, stream) {
  if (ms <= 0) { return stream; }
  return _duplicateStreamOnEmit(stream, delayCall, [EMIT_KEY, ms]);
}

function throttle(ms, stream) {
  if (ms <= 0) { return stream; }
  return _duplicateStreamOnEmit(stream, throttleCall, [EMIT_KEY, ms]);
}

function debounce(ms, stream) {
  if (ms <= 0) { return stream; }
  return _duplicateStreamOnEmit(stream, debounceCall, [EMIT_KEY, ms]);
}

function map(f, stream) {
  return _duplicateStreamOnEmit(stream, compose, [EMIT_KEY, f]);
}

function filter(f, stream) {
  return _duplicateStreamOnEmit(stream, when, [f, EMIT_KEY]);
}

function filterFirst(val, stream) {
  return filter(compose(partial(equals, val), first), stream);
}

export function skipDuplicates(stream) {
  var lastValue;
  return filter(function(val) {
    if (equals(lastValue, val)) {
      return false;
    }
    
    lastValue = val;
    return true;
  }, stream);
}

function sample(sourceStream, sampleStream) {
  return _duplicateStreamOnEmit(sampleStream,
    compose, [EMIT_KEY, partial(getValue, sourceStream)]);
}

export { create, emit, getValue, onValue, offValue, onSubscription, createFromEvents,
         timeout, createFromRAF, merge, delay, throttle, debounce, map,
         filter, filterFirst, sample, interval };
