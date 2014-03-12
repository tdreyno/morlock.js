define("morlock/plugins/jquery.eventstream", 
  ["morlock/core/util","morlock/core/stream"],
  function(__dependency1__, __dependency2__) {
    "use strict";
    var map = __dependency1__.map;
    var Stream = __dependency2__;

    if (('undefined' !== typeof $) && ('undefined' !== typeof $.fn)) {
      
      $.fn.eventstream = function(events) {
        var selectedNodes = this;

        var elementStreams = map(function(node) {
          var elementStream = Stream.create();

          var jQueryWrapper = $(node);

          jQueryWrapper.on(events, function(e) {
            Stream.emit(elementStream, e);
          });

          jQueryWrapper.data('stream', elementStream);

          return elementStream;
        }, selectedNodes);

        if (elementStreams.length > 1) {
          var outputStream = Stream.merge(elementStreams);
        }

        return selectedNodes;
      };

    }
  });