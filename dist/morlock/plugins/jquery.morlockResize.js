define("morlock/plugins/jquery.morlockResize", 
  ["morlock/controllers/resize-controller"],
  function(__dependency1__) {
    "use strict";
    var ResizeController = __dependency1__['default'];

    if ('undefined' !== typeof jQuery) {

      jQuery.fn.morlockResize = function(cb, opts) {
        var rc = new ResizeController(opts);

        return $(this).each(function() {
          if (this === window) {
            var $this = $(this);
            $this.on('morlockResize', cb);
            rc.on('resize', function(e) {
              $this.trigger('morlockResize');
            });
          }
        });
      };

    }
  });