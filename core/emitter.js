var Util = require('../core/util');

function Emitter() {
  if (!(this instanceof Emitter)) {
    return new Emitter();
  }

  this.callbacks = {};
  this.callbackScopes = {};
}

function on(emitter, eventName, callback, scope) {
  if (!emitter.callbacks[eventName]) {
    emitter.callbacks[eventName] = [];
  }

  if (!emitter.callbackScopes[eventName]) {
    emitter.callbackScopes[eventName] = [];
  }

  if (Util.indexOf(emitter.callbacks[eventName], callback) === -1) {
    emitter.callbacks[eventName].push(callback);
    emitter.callbackScopes[eventName].push(scope);
  }
}

function off(emitter, eventName, callback) {
  if (!callback) {
    emitter.callbacks[eventName] = [];
    emitter.callbackScopes[eventName] = [];
    return;
  }

  var idx = Util.indexOf(emitter.callbacks[eventName], callback);

  if (idx !== -1) {
    emitter.callbacks[eventName].splice(idx, 1);
    emitter.callbackScopes[eventName].splice(idx, 1);
  }
}

function trigger(emitter, eventName, options) {
  if (!emitter.callbacks[eventName]) { return; }

  for (var i = 0; i < emitter.callbacks[eventName].length; i++) {
    if (emitter.callbackScopes[eventName][i]) {
      emitter.callbacks[eventName][i].call(emitter.callbackScopes[eventName][i], options);
    } else {
      emitter.callbacks[eventName][i](options);
    }
  }
}

function mixin(object) {
  var emitter = new Emitter();

  object.on = Util.partial(on, emitter);
  object.off = Util.partial(off, emitter);
  object.trigger = Util.partial(trigger, emitter);

  return object;
}

module.exports = { mixin: mixin };