define("morlock/controllers/scroll-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","morlock/streams/resize-stream","morlock/streams/element-tracker-stream","morlock/streams/scroll-tracker-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    var partial = __dependency1__.partial;
    var equals = __dependency1__.equals;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;
    var ResizeStream = __dependency4__;
    var ElementTrackerStream = __dependency5__;
    var ScrollTrackerStream = __dependency6__;

    /**
     * Provides a familiar OO-style API for tracking scroll events.
     * @constructor
     * @param {Object=} options The options passed to the scroll tracker.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ScrollController(options) {
      if (!(this instanceof ScrollController)) {
        return new ScrollController(options);
      }

      var scrollEndStream = ScrollStream.create(options);

      this.on = function(name, cb) {
        if ('scrollEnd' === name) {
          Stream.onValue(scrollEndStream, cb);
        }
      };

      var resizeStream = ResizeStream.create();

      this.observeElement = function observeElement(elem) {
        var trackerStream = ElementTrackerStream.create(elem, scrollEndStream, resizeStream);

        return {
          on: function on(name, cb) {
            Stream.onValue(Stream.filter(partial(equals, name), trackerStream), cb);
          }
        };
      };
    }

    ScrollController.observeScrollPosition = function observeScrollPosition(scrollY, options) {
      var stream = ScrollTrackerStream.create(scrollY);

      return {
        on: function(/* name, cb */) {
          var name = 'both';
          var cb;

          if (arguments.length === 1) {
            cb = arguments[0];
          } else {
            name = arguments[0];
            cb = arguments[1];
          }

          var filteredStream;
          if (name === 'both') {
            filteredStream = stream;
          } else {
            filteredStream = Stream.filter(stream, partial(equals, name));
          }

          Stream.onValue(cb);

          return this;
        }
      };
    };

    __exports__["default"] = ScrollController;
  });