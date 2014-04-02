(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    //Allow using this built library as an AMD module
    //in another project. That other project will only
    //see this AMD call, not the internal modules in
    //the closure below.
    define(factory);
  } else {
    //Browser globals case. Just assign the
    //result to a property on the global.
    var parts = factory();
    root.ResizeController = parts.ResizeController;
    root.BreakpointController = parts.BreakpointController;
    root.ResponsiveImage = parts.ResponsiveImage;
    root.ScrollController = parts.ScrollController;
    root.ElementVisibleController = parts.ElementVisibleController;
    root.ScrollPositionController = parts.ScrollPositionController;
    root.morlock = parts.morlock;
  }
}(this, function () {
  //almond, and your modules will be inlined here