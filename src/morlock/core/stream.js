import { debounce as debounceCall,
         throttle as throttleCall,
         delay as delayCall,
         map as mapArray,
         apply,
         first, rest, push, apply, unshift, eventListener, compose, when,
         partial, once, copyArray, flip, call } from "morlock/core/util";

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
}

function create(trackSubscribers) {
  return new Stream(trackSubscribers);
}

function emit(stream, val) {
  mapArray(partial(flip(call), val), stream.subscribers);

  stream.value = val;
}

function getValue(stream) {
  return stream.value;
}

function onValue(stream, f) {
  stream.subscribers = stream.subscribers || [];
  stream.subscribers.push(f);

  if (stream.trackSubscribers) {
    mapArray(partial(flip(call), f), stream.subscriberSubscribers);
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

function createFromRAF() {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream);

  /**
   * Lazily subscribes to a raf event.
   */
  function sendEvent(t) {
    boundEmit(t);
    requestAnimationFrame(sendEvent);
  }

  onSubscription(outputStream, once(sendEvent));

  return outputStream;
}

function merge(/* streams */) {
  var streams = copyArray(arguments);
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  
  mapArray(function(stream) {
    return onValue(stream, boundEmit);
  }, streams);

  return outputStream;
}

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
  return _duplicateStreamOnEmit(stream, delayCall, [':e:', ms]);
}

function throttle(ms, stream) {
  if (ms <= 0) { return stream; }
  return _duplicateStreamOnEmit(stream, throttleCall, [':e:', ms]);
}

function debounce(ms, stream) {
  if (ms <= 0) { return stream; }
  return _duplicateStreamOnEmit(stream, debounceCall, [':e:', ms]);
}

function map(f, stream) {
  return _duplicateStreamOnEmit(stream, compose, [':e:', f]);
}

function filter(f, stream) {
  return _duplicateStreamOnEmit(stream, when, [f, ':e:']);
}

function sample(sourceStream, sampleStream) {
  return _duplicateStreamOnEmit(sampleStream,
    compose, [':e:', partial(getValue, sourceStream)]);
}

export { create, emit, getValue, onValue, onSubscription, createFromEvents,
         timeout, createFromRAF, merge, delay, throttle, debounce, map,
         filter, sample, interval };
