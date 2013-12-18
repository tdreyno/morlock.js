# Morlock.js [![Build Status](https://travis-ci.org/tdreyno/morlock.js.png?branch=master)](https://travis-ci.org/tdreyno/morlock.js)

Morlock.js is a foundational Javascript library which provides responsive tools and scroll behaviors which can be used to build modern websites.

The core components are:

* **ResizeController**: provides throttled resize events and breakpoint enter/exit events. Aliased as `$(window).morlockResize`.
* **ResponsiveImage**: swaps out images based on the current viewport. Aliased as `$(img).morlockImage`.
* **ScrollController**: provides throttled scroll events, scrollEnd events, element "on screen visibility" events and vertical before/after scroll events. Aliased as `$(window).morlockScroll`.

For the adventurous, the entire core of Morlock.js is written using a purely functional approach to Javascript, event streams and Functional Reactive Programming. If that sounds like nonsense, don't worry, the public API is provided as both traditional Class constructors or jQuery plugins.

## ResizeController

## Responsive Image

## ScrollController