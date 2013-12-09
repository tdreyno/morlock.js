define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/scroll-controller","morlock/core/responsive-image","morlock/plugins/jquery.breakpointer","morlock/plugins/jquery.scrolltracker","morlock/plugins/jquery.eventstream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    var ResizeController = __dependency1__["default"];
    var ScrollController = __dependency2__["default"];
    var ResponsiveImage = __dependency3__;
    __exports__.ResizeController = ResizeController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
  });