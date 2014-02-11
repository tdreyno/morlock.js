import ResizeController from "morlock/controllers/resize-controller";

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
