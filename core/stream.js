var Events = require('../core/events');
var Buffer = require('../core/buffer');
var Util = require('../core/util');

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
  this.values = Util.isDefined(buffer) ? buffer : Buffer.create(1, 'sliding');
  this.closed = false;
  this.closeSubscribers = null;
  this.emptySubscribers = null;

  openStreams[this.streamID] = this;
}

function create(trackSubscribers, buffer) {
  return new Stream(trackSubscribers, buffer);
}

var emit = Util.autoCurry(function emit_(stream, val) {
  if (stream.closed) { return; }

  if (stream.subscribers) {
    for (var i = 0; i < stream.subscribers.length; i++) {
      stream.subscribers[i](val);
    }
  }

  Buffer.push(stream.values, val);
});

function getValue(stream) {
  return Buffer.lastValue(stream.values);
}

function onValue(stream, f) {
  if (stream.closed) { return; }

  stream.subscribers = stream.subscribers || [];
  stream.subscribers.push(f);

  if (stream.trackSubscribers) {
    Util.map(Util.unary(Util.partial(Util.flippedCall, f)), stream.subscriberSubscribers);
  }

  return Util.partial(offValue, stream, f);
}

function close(stream) {
  if (stream.closed) { return; }

  stream.closed = true;
  Buffer.clear(stream.values);

  if (stream.subscribers) {
    stream.subscribers.length = 0;
  }

  if (stream.closeSubscribers) {
    Util.map(Util.flippedCall, stream.closeSubscribers);
    stream.closeSubscribers.length = 0;
  }

  delete openStreams[stream.streamID];
}

function offValue(stream, f) {
  if (stream.subscribers) {
    var idx = Util.indexOf(stream.subscribers, f);
    if (idx !== -1) {
      stream.subscribers.splice(idx, 1);
    }

    if (stream.subscribers.length < 1) {
      stream.subscribers = null;
      Util.map(Util.flippedCall, stream.emptySubscribers);
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

    unsubFunc = Events.eventListener(target, eventName, function() {
      if (outputStream.closed) {
        detachListener_();
      } else {
        Util.apply(boundEmit, arguments);
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

  onSubscription(outputStream, Util.once(attachListener));

  return outputStream;
}

function timeout(ms) {
  var outputStream = create(true);
  var boundEmit = Util.partial(emit, outputStream, true);

  /**
   * Lazily subscribes to a timeout event.
   */
  var attachListener = Util.partial(setTimeout, boundEmit, ms);
  onSubscription(outputStream, Util.once(attachListener));

  return outputStream;
}

var createFromRAF = Util.memoize(function createFromRAF_() {
  var rAFStream = create(true);
  var boundEmit = emit(rAFStream);

  /**
   * Lazily subscribes to a raf event.
   */
  function sendEvent(t) {
    if (!rAFStream.closed) {
      requestAnimationFrame(sendEvent);
      boundEmit(t);
    }
  }

  onSubscription(rAFStream, Util.once(sendEvent));

  return rAFStream;
});

function merge(/* streams */) {
  var streams = Util.copyArray(arguments);
  var outputStream = create();
  var boundEmit = emit(outputStream);
  
  // var childStreams = {};

  // Map used for side-effects
  Util.map(function(stream) {
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

function duplicateStreamOnEmit_(stream, f, args) {
  var outputStream = create();
  var boundEmit = Util.partial(emit, outputStream);
  var boundArgs = Util.map(function(v) {
    return v === EMIT_KEY ? boundEmit : v;
  }, args);

  // var offValFunc = 
  onValue(stream, Util.apply(Util.apply, [f, boundArgs]));
  // onClose(outputStream, offValFunc);
  // onEmpty(outputStream, Util.partial(close, outputStream));

  return outputStream;
}

function delay(ms, stream) {
  if (ms <= 0) { return stream; }
  return duplicateStreamOnEmit_(stream, Util.delay, [EMIT_KEY, ms]);
}

function throttle(ms, stream) {
  if (ms <= 0) { return stream; }
  return duplicateStreamOnEmit_(stream, Util.throttle, [EMIT_KEY, ms]);
}

function debounce(ms, stream) {
  if (ms <= 0) { return stream; }
  return duplicateStreamOnEmit_(stream, Util.debounce, [EMIT_KEY, ms]);
}

function map(f, stream) {
  return duplicateStreamOnEmit_(stream, Util.compose, [EMIT_KEY, f]);
}

function filter(f, stream) {
  return duplicateStreamOnEmit_(stream, Util.when, [f, EMIT_KEY]);
}

function filterFirst(val, stream) {
  return filter(Util.compose(Util.equals(val), Util.first), stream);
}

function skipDuplicates(stream) {
  var lastValue;
  return filter(function checkDuplicate_(val) {
    if (Util.equals(lastValue, val)) {
      return false;
    }
    
    lastValue = val;
    return true;
  }, stream);
}

function sample(sourceStream, sampleStream) {
  return duplicateStreamOnEmit_(sampleStream,
    Util.compose, [EMIT_KEY, Util.partial(getValue, sourceStream)]);
}

module.exports = {
  create: create,
  getValue: getValue,
  onValue: onValue,
  offValue: offValue,
  onSubscription: onSubscription,
  createFromEvents: createFromEvents,
  timeout: timeout,
  createFromRAF: createFromRAF,
  merge: merge,
  delay: delay,
  throttle: throttle,
  debounce: debounce,
  map: map,
  filter: filter,
  filterFirst: filterFirst,
  sample: sample,
  interval: interval,
  openStreams: openStreams,
  skipDuplicates: skipDuplicates,
  emit: emit,
  close: close,
  onClose: onClose,
  onEmpty: onEmpty
};
