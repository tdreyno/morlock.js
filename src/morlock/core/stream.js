import { debounce as debounceCall,
         throttle as throttleCall,
         delay as delayCall,
         map as mapArray,
         first, rest, push, apply, unshift, eventListener, compose, when,
         partial, once } from "morlock/core/util";

var nextID = 0;

/**
 * Ghetto Record implementation.
 */
function Stream(trackSubscribers) {
  if (!(this instanceof Stream)) {
    return new Stream(trackSubscribers);
  }

  this.trackSubscribers = !!trackSubscribers;
  this.subscribers = [];
  this.subscriberSubscribers = this.trackSubscribers ? [] : null;
  this.streamID = nextID++;
  this.value = null; // TODO: Some kind of buffer
}

function create(trackSubscribers) {
  return new Stream(trackSubscribers);
}

function emit(stream, val) {
  mapArray(function(s) {
    return s(val);
  }, stream.subscribers);

  stream.value = val;
}

function getValue(stream) {
  return stream.value;
}

function onValue(stream, f) {
  stream.subscribers.push(f);

  if (stream.trackSubscribers) {
    mapArray(function(s) {
      return s(f);
    }, stream.subscriberSubscribers);
  }
}

function onSubscription(stream, f) {
  if (stream.trackSubscribers) {
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

function timeout(ms) {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = partial(setInterval, boundEmit, ms);
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

function merge(/*args*/) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  
  mapArray(function(stream) {
    return onValue(stream, boundEmit);
  }, arguments);

  return outputStream;
}

function delay(ms, stream) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  onValue(stream, delayCall(boundEmit, ms));
  return outputStream;
}

function throttle(ms, stream) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  var f = ms > 0 ? throttleCall(boundEmit, ms) : boundEmit;
  onValue(stream, f);
  return outputStream;
}

function debounce(ms, stream) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  onValue(stream, debounceCall(boundEmit, ms));
  return outputStream;
}

function map(f, stream) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  onValue(stream, compose(boundEmit, f));
  return outputStream;
}

function filter(f, stream) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  onValue(stream, when(f, boundEmit));
  return outputStream;
}

function sample(sourceStream, sampleStream) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  onValue(sampleStream, compose(boundEmit, partial(getValue, sourceStream)));
  return outputStream;
}

export { create, emit, getValue, onValue, onSubscription, createFromEvents,
         timeout, createFromRAF, merge, delay, throttle, debounce, map,
         filter, sample };
