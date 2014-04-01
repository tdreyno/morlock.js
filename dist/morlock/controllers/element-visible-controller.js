define("morlock/controllers/element-visible-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/element-tracker-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var partial = __dependency1__.partial;
    var equals = __dependency1__.equals;
    var Stream = __dependency2__;
    var ElementTrackerStream = __dependency3__;

    /**
     * Provides a familiar OO-style API for tracking element position.
     * @constructor
     * @param {Element} elem The element to track
     * @param {Object=} options The options passed to the position tracker.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ElementVisibleController(elem, options) {
      if (!(this instanceof ElementVisibleController)) {
        return new ElementVisibleController(elem, options);
      }

      var trackerStream = ElementTrackerStream.create(elem, options);

      var enterStream = Stream.filter(partial(equals, 'enter'), trackerStream);
      var exitStream = Stream.filter(partial(equals, 'exit'), trackerStream);

      function onOffStream(args, f) {
        var name = 'both';
        var cb;

        if (args.length === 1) {
          cb = args[0];
        } else {
          name = args[0];
          cb = args[1];
        }

        var filteredStream;
        if (name === 'both') {
          filteredStream = trackerStream;
        } else if (name === 'enter') {
          filteredStream = enterStream;
        } else if (name === 'exit') {
          filteredStream = exitStream;
        }

        f(filteredStream, cb);
        
        if ((f === Stream.onValue) && (trackerStream.value === name)) {
          Stream.emit(filteredStream, trackerStream.value);
        }
      }

      return {
        on: function on(/* name, cb */) {
          onOffStream(arguments, Stream.onValue);

          return this;
        },

        off: function(/* name, cb */) {
          onOffStream(arguments, Stream.offValue);

          return this;
        }
      };
    }

    __exports__["default"] = ElementVisibleController;
  });