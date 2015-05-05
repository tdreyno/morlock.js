var registry_ = [];

function addEventListener_(target, type, listener) {
  if (target.addEventListener) {
    return target.addEventListener(type, listener);
  } else {
    registry_.unshift([target, type, listener, function (event) {
      event.currentTarget = target;
      event.preventDefault = function () { event.returnValue = false; };
      event.stopPropagation = function () { event.cancelBubble = true; };
      event.target = event.srcElement || target;

      listener.call(target, event);
    }]);

    return target.attachEvent('on' + type, registry_[0][3]);
  }
};

function removeEventListener_(target, type, listener) {
  if (target.removeEventListener) {
    return target.removeEventListener(type, listener);
  } else {
    for (var index = 0, register; (register = registry_[index]); ++index) {
      if (register[0] == target && register[1] == type && register[2] == listener) {
        return target.detachEvent('on' + type, registry_.splice(index, 1)[0][3]);
      }
    }
  }
};

function dispatchEvent_(target, eventObject) {
  if (target.dispatchEvent) {
    return target.dispatchEvent(eventObject);
  } else {
    return target.fireEvent('on' + (eventObject.type || eventObject.eventType), eventObject);
  }
};

var eventListenerInfo = { count: 0 };

function eventListener(target, eventName, cb) {
  addEventListener_(target, eventName, cb, false);
  eventListenerInfo.count++;

  return function eventListenerRemove_() {
    removeEventListener_(target, eventName, cb, false);
    eventListenerInfo.count--;
  };
}

function dispatchEvent(target, evType) {
  var evObj;
  if (document.createEvent) {
    evObj = document.createEvent('HTMLEvents');
    evObj.initEvent(evType, true, true);
  } else {
    evObj = document.createEventObject();
    evObj.eventType = evType;
  }
  evObj.eventName = evType;

  dispatchEvent_(target, evObj);
}

module.exports = {
  eventListenerInfo: eventListenerInfo,
  eventListener: eventListener,
  dispatchEvent: dispatchEvent
};
