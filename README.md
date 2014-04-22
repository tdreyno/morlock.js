# Morlock.js [![Build Status](https://travis-ci.org/tdreyno/morlock.js.png?branch=master)](https://travis-ci.org/tdreyno/morlock.js)

Morlock.js is a Javascript library which provides responsive tools and scroll behaviors which can be used to build modern websites.

The core components are:

* **ResizeController**: provides throttled resize events and breakpoint enter/exit events. Aliased as `$(window).morlockResize`.
* **ResponsiveImage**: swaps out images based on the current viewport. Aliased as `$(img).morlockImage`.
* **ScrollController**: provides throttled scroll events, scrollEnd events, element "on screen visibility" events and vertical before/after scroll events. Aliased as `$(window).morlockScroll`.

For the adventurous, the entire core of Morlock.js is written using a purely functional approach to Javascript, event streams and Functional Reactive Programming. If that sounds like nonsense, don't worry, the public API is provided as both traditional Class constructors or jQuery plugins.

## Resize Events

The `morlock.onResize` will allow you to listen to `window.resize` events.

```
morlock.onResize(function(e) {
  console.log('width',  e[0]);
  console.log('height', e[1]);
});
```

You can also listen to `onResizeEnd` which will call after events have stopped coming in. The `debounceMs` defaults to 200ms.

```
morlock.onResizeEnd(function(e) {
  console.log('width',  e[0]);
  console.log('height', e[1]);
}, { debounceMs: 400 });
```

There is also a jQuery plugin for this behavior. Calling `morlockResize` will begin triggering `morlockResize` events on the `window` element. Use normal jQuery events to attach callbacks.

```
$(window).morlockResize({ debounceMs: 400 });

$(window).on('morlockResize', function(e, w, h) {
  console.log('resize', w, h);
});

$(window).on('morlockResizeEnd', function(e, w, h) {
  console.log('resizeEnd', w, h);
});
```

## Responsive Image

## ScrollController