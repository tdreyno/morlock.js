import { eventListener } from "morlock/core/events";
import { create as createBuffer,
         push as pushBuffer,
         clear as clearBuffer,
         lastValue as lastBufferValue } from "morlock/core/buffer";
import { debounce as debounceCall,
         throttle as throttleCall,
         delay as delayCall,
         map as mapArray,
         memoize, first, apply, compose, when, equals, unary, flippedCall, isDefined,
         partial, once, copyArray, indexOf, rAF } from "morlock/core/util";

// Internal tracking of how many streams have been created.
var nextID = 0;

export var openStreams = {};

/**
 * Ghetto Record implementation.
 */
function Stream(trackSubscribers, buffer) {
  if (!(this instanceof Stream)) {
    return new Stream(trackSubscribers, buffer);
  }

  this.trackSubscribers = !!trackSubscribers;
  this.subscribers = null;
  this.subscriberSubscribers = null;
  this.streamID = nextID++;
  this.values = isDefined(buffer) ? buffer : createBuffer(1, 'sliding');
  this.closed = false;
  this.closeSubscribers = null;
  this.emptySubscribers = null;

  openStreams[this.streamID] = this;
}

function create(trackSubscribers, buffer) {
  return new Stream(trackSubscribers, buffer);
}

function emit(stream, val) {
  if (stream.closed) { return; }

  mapArray(unary(partial(flippedCall, val)), stream.subscribers);

  pushBuffer(stream.values, val);
}

function getValue(stream) {
  return lastBufferValue(stream.values);
}

function onValue(stream, f) {
  if (stream.closed) { return; }

  stream.subscribers = stream.subscribers || [];
  stream.subscribers.push(f);

  if (stream.trackSubscribers) {
    mapArray(unary(partial(flippedCall, f)), stream.subscriberSubscribers);
  }

  return partial(offValue, stream, f);
}

export function close(stream) {
  if (stream.closed) { return; }

  stream.closed = true;
  clearBuffer(stream.values);

  if (stream.subscribers) {
    stream.subscribers.length = 0;
  }

  if (stream.closeSubscribers) {
    mapArray(flippedCall, stream.closeSubscribers);
    stream.closeSubscribers.length = 0;
  }

  delete openStreams[stream.streamID];
}

function offValue(stream, f) {
  if (stream.subscribers) {
    var idx = indexOf(stream.subscribers, f);
    if (idx !== -1) {
      stream.subscribers.splice(idx, 1);
    }

    if (stream.subscribers.length < 1) {
      stream.subscribers = null;
      mapArray(flippedCall, stream.emptySubscribers);
    }
  }
}

function onSubscription(stream, f) {
  if (stream.trackSubscribers) {
    stream.subscriberSubscribers || (stream.subscriberSubscribers = []);
    stream.subscriberSubscribers.push(f);
  }
}

export function onClose(stream, f) {
  stream.closeSubscribers || (stream.closeSubscribers = []);
  stream.closeSubscribers.push(f);
}

export function onEmpty(stream, f) {
  stream.emptySubscribers || (stream.emptySubscribers = []);
  stream.emptySubscribers.push(f);
}

function createFromEvents(target, eventName) {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream);

  var isListening = false;
  var unsubFunc;

  function detachListener_() {
    if (!isListening) { return; }

    if (unsubFunc) {
      unsubFunc();
      unsubFunc = null;
      isListening = false;
    }
  }

  /**
   * Lazily subscribes to a dom event.
   */
  function attachListener_() {
    if (isListening) { return; }
    isListening = true;

    unsubFunc = eventListener(target, eventName, function() {
      if (outputStream.closed) {
        detachListener_();
      } else {
        apply(boundEmit, arguments);
      }
    });

    onClose(outputStream, detachListener_);
  }

  onSubscription(outputStream, attachListener_);
  onEmpty(outputStream, detachListener_);

  return outputStream;
}

function interval(ms) {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = function attach_() {
    var intervalId = setInterval(function() {
      if (outputStream.closed) {
        clearInterval(intervalId);
      } else {
        apply(boundEmit, arguments);
      }
    }, ms);
  };

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
    if (!rAFStream.closed) {
      boundEmit(t);
      rAF(sendEvent);
    }
  }

  onSubscription(rAFStream, once(sendEvent));

  return rAFStream;
});

function merge(/* streams */) {
  var streams = copyArray(arguments);
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  
  // var childStreams = {};

  // Map used for side-effects
  mapArray(function(stream) {
    // childStreams[stream.streamID] = true;

    var offValFunc = onValue(stream, boundEmit);
    onClose(outputStream, offValFunc);

    // function cleanup() {
    //   delete childStreams[stream.streamID];

    //   if (objectKeys(childStreams).length < 1) {
    //     close(outputStream);
    //   }
    // }

    // onClose(stream, cleanup);
    // onEmpty(stream, cleanup);
  }, streams);

  // onEmpty(outputStream, function() {
  //   debugger;
  // });

  return outputStream;
}

var EMIT_KEY = ':e:';

function _duplicateStreamOnEmit(stream, f, args) {
  var outputStream = create();
  var boundEmit = partial(emit, outputStream);
  var boundArgs = mapArray(function(v) {
    return v === EMIT_KEY ? boundEmit : v;
  }, args);

  // var offValFunc = 
  onValue(stream, apply(apply, [f, boundArgs]));
  // onClose(outputStream, offValFunc);
  // onEmpty(outputStream, partial(close, outputStream));

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
