define("morlock/plugins/jquery.scrolltracker", 
  ["morlock/controllers/scroll-controller"],
  function(__dependency1__) {
    "use strict";
    var ScrollController = __dependency1__["default"];

    if ('undefined' !== typeof $) {

      $.fn.scrolltracker = function() {

      };

    }
  });