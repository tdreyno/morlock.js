import { map } from "morlock/core/util";
module Stream from "morlock/core/stream";

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