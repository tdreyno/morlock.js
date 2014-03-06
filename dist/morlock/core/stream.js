define("morlock/core/stream", 
  ["morlock/core/util","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var debounceCall = __dependency1__.debounce;
    var throttleCall = __dependency1__.throttle;
    var delayCall = __dependency1__.delay;
    var mapArray = __dependency1__.map;
    var apply = __dependency1__.apply;
    var first = __dependency1__.first;
    var rest = __dependency1__.rest;
    var push = __dependency1__.push;
    var apply = __dependency1__.apply;
    var unshift = __dependency1__.unshift;
    var eventListener = __dependency1__.eventListener;
    var compose = __dependency1__.compose;
    var when = __dependency1__.when;
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

    function createFromRAF() {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream);

      /**
       * Lazily subscribes to a raf event.
       */
      function sendEvent(t) {
        boundEmit(t);
        rAF(sendEvent);
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
    __exports__.sample = sample;
    __exports__.interval = interval;
  });