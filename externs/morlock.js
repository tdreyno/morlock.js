var Morlock = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {}
};
var ResizeController = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {}
};
var BreakpointController = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {},
  'getActiveBreakpoints': function() {}
};
var ScrollController = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {}
};
var ElementVisibleController = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {}
};
var ScrollPositionController = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {}
};
var StickyElementController = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {}
};
var ResponsiveImage = {
  'on': function() {},
  'off': function() {},
  'destroy': function() {}
};

var morlock = {};

/**
 * @type {morlock.position}
 */
morlock.position = {};

/**
 * Morlock position before.
 */
morlock.position.before = function() {};

/**
 * Morlock position after.
 */
morlock.position.after = function() {};

/**
 * @type {morlock.breakpoint}
 */
morlock.breakpoint = {};

/**
 * Morlock breakpoint enter.
 */
morlock.breakpoint.enter = function() {};

/**
 * Morlock breakpoint exit.
 */
morlock.breakpoint.exit = function() {};

/**
 * Morlock enable jQuery.
 */
morlock.enableJQuery = function() {};
