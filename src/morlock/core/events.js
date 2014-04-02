var registry_ = [];
var addEventListener_ = window.addEventListener || function fallbackAddRemoveEventListener_(type, listener) {
  var target = this;

  registry_.unshift([target, type, listener, function (event) {
    event.currentTarget = target;
    event.preventDefault = function () { event.returnValue = false; };
    event.stopPropagation = function () { event.cancelBubble = true; };
    event.target = event.srcElement || target;

    listener.call(target, event);
  }]);

  this.attachEvent("on" + type, registry_[0][3]);
};

var removeEventListener_ = window.removeEventListener || function fallbackRemoveEventListener_(type, listener) {
  for (var index = 0, register; (register = registry_[index]); ++index) {
    if (register[0] == this && register[1] == type && register[2] == listener) {
      return this.detachEvent("on" + type, registry_.splice(index, 1)[0][3]);
    }
  }
};

var dispatchEvent_ = window.dispatchEvent || function (eventObject) {
  return this.fireEvent("on" + eventObject.type, eventObject);
};

export var eventListenerInfo = { count: 0 };

export function eventListener(target, eventName, cb) {
  addEventListener_.call(target, eventName, cb, false);
  eventListenerInfo.count++;

  return function eventListenerRemove_() {
    removeEventListener_.call(target, eventName, cb, false);
    eventListenerInfo.count--;
  };
}

export function dispatchEvent(target, evType) {
  var evObj = document.createEvent('HTMLEvents');
  evObj.initEvent(evType, true, true);
  dispatchEvent_.call(target, evObj);
}