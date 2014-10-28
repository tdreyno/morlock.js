define("morlock/core/stream", 
  ["morlock/core/events","morlock/core/buffer","morlock/core/util","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var eventListener = __dependency1__.eventListener;
    var createBuffer = __dependency2__.create;
    var pushBuffer = __dependency2__.push;
    var clearBuffer = __dependency2__.clear;
    var lastBufferValue = __dependency2__.lastValue;
    var debounceCall = __dependency3__.debounce;
    var throttleCall = __dependency3__.throttle;
    var delayCall = __dependency3__.delay;
    var mapArray = __dependency3__.map;
    var memoize = __dependency3__.memoize;
    var first = __dependency3__.first;
    var apply = __dependency3__.apply;
    var compose = __dependency3__.compose;
    var when = __dependency3__.when;
    var equals = __dependency3__.equals;
    var unary = __dependency3__.unary;
    var flippedCall = __dependency3__.flippedCall;
    var isDefined = __dependency3__.isDefined;
    var autoCurry = __dependency3__.autoCurry;
    var partial = __dependency3__.partial;
    var once = __dependency3__.once;
    var copyArray = __dependency3__.copyArray;
    var indexOf = __dependency3__.indexOf;
    var rAF = __dependency3__.rAF;

    // Internal tracking of how many streams have been created.
    var nextID = 0;

    var openStreams = {};
    __exports__.openStreams = openStreams;
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

    var emit = autoCurry(function emit_(stream, val) {
      if (stream.closed) { return; }

      if (stream.subscribers) {
        for (var i = 0; i < stream.subscribers.length; i++) {
          stream.subscribers[i](val);
        }
      }

      pushBuffer(stream.values, val);
    });
    __exports__.emit = emit;
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

    __exports__.close = close;function offValue(stream, f) {
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

    function onClose(stream, f) {
      stream.closeSubscribers || (stream.closeSubscribers = []);
      stream.closeSubscribers.push(f);
    }

    __exports__.onClose = onClose;function onEmpty(stream, f) {
      stream.emptySubscribers || (stream.emptySubscribers = []);
      stream.emptySubscribers.push(f);
    }

    __exports__.onEmpty = onEmpty;function createFromEvents(target, eventName) {
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

    var createFromRAF = memoize(function createFromRAF_() {
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

    function merge(/* streams */) {
      var streams = copyArray(arguments);
      var outputStream = create();
      var boundEmit = emit(outputStream);
      
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

    __exports__.skipDuplicates = skipDuplicates;function sample(sourceStream, sampleStream) {
      return duplicateStreamOnEmit_(sampleStream,
        compose, [EMIT_KEY, partial(getValue, sourceStream)]);
    }

    __exports__.create = create;
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