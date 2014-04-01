define("morlock/core/stream", 
  ["morlock/core/util","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var debounceCall = __dependency1__.debounce;
    var throttleCall = __dependency1__.throttle;
    var delayCall = __dependency1__.delay;
    var mapArray = __dependency1__.map;
    var apply = __dependency1__.apply;
    var memoize = __dependency1__.memoize;
    var first = __dependency1__.first;
    var rest = __dependency1__.rest;
    var push = __dependency1__.push;
    var apply = __dependency1__.apply;
    var unshift = __dependency1__.unshift;
    var eventListener = __dependency1__.eventListener;
    var compose = __dependency1__.compose;
    var when = __dependency1__.when;
    var equals = __dependency1__.equals;
    var partial = __dependency1__.partial;
    var once = __dependency1__.once;
    var copyArray = __dependency1__.copyArray;
    var flip = __dependency1__.flip;
    var call = __dependency1__.call;
    var indexOf = __dependency1__.indexOf;
    var rAF = __dependency1__.rAF;

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

    function closeStream(stream) {
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

    function skipDuplicates(stream) {
      var lastValue;
      return filter(function(val) {
        if (equals(lastValue, val)) {
          return false;
        }
        
        lastValue = val;
        return true;
      }, stream);
    }

    __exports__.skipDuplicates = skipDuplicates;function sample(sourceStream, sampleStream) {
      return _duplicateStreamOnEmit(sampleStream,
        compose, [EMIT_KEY, partial(getValue, sourceStream)]);
    }

    __exports__.create = create;
    __exports__.emit = emit;
    __exports__.getValue = getValue;
    __exports__.onValue = onValue;
    __exports__.offValue = offValue;
    __exports__.onSubscription = onSubscription;
    __exports__.createFromEvents = createFromEvents;
    __exports__.timeout = timeout;
    __exports__.createFromRAF = createFromRAF;
    __exports__.merge = merge;
    __exports__.delay = delay;
    __exports__.throttle = throttle;
    __exports__.debounce = debounce;
    __exports__.map = map;
    __exports__.filter = filter;
    __exports__.filterFirst = filterFirst;
    __exports__.sample = sample;
    __exports__.interval = interval;
  });