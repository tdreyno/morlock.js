import { partial, equals, compose, constantly, first } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
module ResizeStream from "morlock/streams/resize-stream";
module ElementTrackerStream from "morlock/streams/element-tracker-stream";
module ScrollTrackerStream from "morlock/streams/scroll-tracker-stream";

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

  this.id = ScrollController.nextID++;

  var scrollEndStream = ScrollStream.create(options);

  this.on = function(name, cb) {
    if ('scrollEnd' === name) {
      Stream.onValue(scrollEndStream, cb);
    }
  };

  var resizeStream = ResizeStream.create();

  ScrollController.instances[this.id] = this;

  // TODO: better tear down
  this.destroy = function destroy() {
    delete ScrollController.instances[this.id];
  };

  this.observeElement = function observeElement(elem, options) {
    var trackerStream = ElementTrackerStream.create(elem, scrollEndStream, resizeStream, options);

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
  };

  this.observePosition = function observePosition(targetScrollY) {
    var trackerStream = ScrollTrackerStream.create(targetScrollY, scrollEndStream);

    var beforeStream = Stream.filterFirst('before', trackerStream);
    var afterStream = Stream.filterFirst('after', trackerStream);

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
      } else if (name === 'before') {
        filteredStream = beforeStream;
      } else if (name === 'after') {
        filteredStream = afterStream;
      }

      f(filteredStream, cb);
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
  };
}

ScrollController.instances = {};
ScrollController.nextID = 1;

export default = ScrollController;
