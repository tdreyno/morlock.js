function throttle(func, wait) {
  var context, args, timeout, result;
  var previous = 0;
  var later = function() {
    previous = +(new Date());
    timeout = null;
    result = func.apply(context, args);
  };
  return function() {
    var now = +(new Date());
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

function debounce(func, wait, immediate) {
  var result;
  var timeout = null;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) result = func.apply(context, args);
    return result;
  };
}

var win = window, docElem = document.documentElement;

function rectangle(el, cushion) {
  var o = {};
  el && !el.nodeType && (el = el[0]);
  if (!el || 1 !== el.nodeType) { return false; }
  cushion = typeof cushion == 'number' && cushion || 0;
  el = el.getBoundingClientRect(); // read-only
  o['width'] = (o['right'] = el['right'] + cushion) - (o['left'] = el['left'] - cushion);
  o['height'] = (o['bottom'] = el['bottom'] + cushion) - (o['top'] = el['top'] - cushion);
  return o;
}

function makeViewportGetter(dim, inner, client) {
  // @link  responsejs.com/labs/dimensions/
  // @link  quirksmode.org/mobile/viewports2.html
  // @link  github.com/ryanve/response.js/issues/17
  return docElem[client] < win[inner] && testMQ('(min-' + dim + ':' + win[inner] + 'px)') ? function() {
      return win[inner]; 
  } : function() {
      return docElem[client];
  };
}

function testMQ(mq) {
  var matchMedia = window.matchMedia || window.msMatchMedia;
  if (matchMedia) {
    return matchMedia(mq).matches;
  }

  var div = document.createElement('div');
  div.id = 'testmq';
  div.innerHTML += '&#173; <style id="stestmq">@media ' + mq + ' { #testmq { position: absolute; } }</style>';
  document.body.appendChild(div);

  return (window.getComputedStyle ?
          getComputedStyle(div, null) :
          div.currentStyle)['position'] == 'absolute';
}


var viewportW = makeViewportGetter('width', 'innerWidth', 'clientWidth');
var viewportH = makeViewportGetter('height', 'innerHeight', 'clientHeight');

export { throttle, debounce, rectangle, viewportH, viewportW, testMQ }
