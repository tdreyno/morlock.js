'use strict';

var { eventListener } = require('morlock/core/events');
var Buffer = require('morlock/core/buffer');
var createBuffer = Buffer.create;
var pushBuffer = Buffer.push;
var clearBuffer = Buffer.clear;
var lastBufferValue = Buffer.lastValue;

var { indexOf, curry, once, apply, compose } = require('ramda');
var Util = require('morlock/core/util');
var debounceCall = Util.debounce;
var throttleCall = Util.throttle;
var delayCall = Util.delay;
var mapArray = Util.map;
var { first, when, equals, unary, flippedCall, isDefined,
      partial, rAF } = Util;

// Internal tracking of how many streams have been created.
var nextID = 0;

var openStreams = {};

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

var emit = curry(function emit_(stream, val) {
  if (stream.closed) { return; }

  if (stream.subscribers) {
    for (var i = 0; i < stream.subscribers.length; i++) {
      stream.subscribers[i](val);
    }
  }

  pushBuffer(stream.values, val);
});

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

function close(stream) {
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
    var idx = indexOf(f, stream.subscribers);
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

function onClose(stream, f) {
  stream.closeSubscribers || (stream.closeSubscribers = []);
  stream.closeSubscribers.push(f);
}

function onEmpty(stream, f) {
  stream.emptySubscribers || (stream.emptySubscribers = []);
  stream.emptySubscribers.push(f);
}

function createFromEvents(target, eventName) {
  var outputStream = create(true);
  var boundEmit = emit(outputStream);

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
  var boundEmit = emit(outputStream);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = function attach_() {
    var i = 0;
    var intervalId = setInterval(function() {
      if (outputStream.closed) {
        clearInterval(intervalId);
      } else {
        boundEmit(i++);
      }
    }, ms);
  };

  onSubscription(outputStream, once(attachListener));

  return outputStream;
}

function timeout(ms) {
  var outputStream = create(true);
  var boundEmit = partial(emit, outputStream, true);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = partial(setTimeout, boundEmit, ms);
  onSubscription(outputStream, once(attachListener));

  return outputStream;
}

var createFromRAF = once(function createFromRAF_() {
  var rAFStream = create(true);
  var boundEmit = emit(rAFStream);

  /**
   * Lazily subscribes to a raf event.
   */
  function sendEvent(t) {
    if (!rAFStream.closed) {
      rAF(sendEvent);
      boundEmit(t);
    }
  }

  onSubscription(rAFStream, once(sendEvent));

  return rAFStream;
});

function merge(...streams) {
  var outputStream = create();
  var boundEmit = emit(outputStream);
  
  // Map used for side-effects
  mapArray(function(stream) {
    var offValFunc = onValue(stream, boundEmit);
    onClose(outputStream, offValFunc);
  }, streams);

  return outputStream;
}

var EMIT_KEY = ':e:';

function duplicateStreamOnEmit_(stream, f, args) {
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
  return duplicateStreamOnEmit_(stream, delayCall, [EMIT_KEY, ms]);
}

function throttle(ms, stream) {
  if (ms <= 0) { return stream; }
  return duplicateStreamOnEmit_(stream, throttleCall, [EMIT_KEY, ms]);
}

function debounce(ms, stream) {
  if (ms <= 0) { return stream; }
  return duplicateStreamOnEmit_(stream, debounceCall, [EMIT_KEY, ms]);
}

function map(f, stream) {
  return duplicateStreamOnEmit_(stream, compose, [EMIT_KEY, f]);
}

function filter(f, stream) {
  return duplicateStreamOnEmit_(stream, when, [f, EMIT_KEY]);
}

function filterFirst(val, stream) {
  return filter(compose(equals(val), first), stream);
}

function skipDuplicates(stream) {
  var lastValue;
  return filter(function checkDuplicate_(val) {
    if (equals(lastValue, val)) {
      return false;
    }
    
    lastValue = val;
    return true;
  }, stream);
}

function sample(sourceStream, sampleStream) {
  return duplicateStreamOnEmit_(sampleStream,
    compose, [EMIT_KEY, partial(getValue, sourceStream)]);
}

module.exports = {
  create, getValue, onValue, offValue, onSubscription, createFromEvents,
  timeout, createFromRAF, merge, delay, throttle, debounce, map,
  filter, filterFirst, sample, interval, openStreams, emit, close,
  onClose, onEmpty, skipDuplicates };
