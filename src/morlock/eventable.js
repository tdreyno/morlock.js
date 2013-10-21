import { indexOf } from "./morlock/util";

/**
 * A class which encapsulates an event.
 * @constructor
 * @param {String} type The type of the event.
 * @param {Object} data Additional data to attach to the event.
 */
function Event(type, data) {
  this.type = type;

  for (var key in data) {
    if (!data.hasOwnProperty(key)) {
      continue;
    }

    this[key] = data[key];
  }
}

/**
 * Get the list of callbacks attached to an object.
 * @private
 * @param {Object} obj The object to look up on.
 * @return {Object} Hash of event names and callback arrays.
 */
function getObjCallbacks_(obj) {
  if ('undefined' === typeof obj.eventableCallbacks_) {
    obj.eventableCallbacks_ = {};
  }

  return obj.eventableCallbacks_;
}

/**
 * Listen to events on an object.
 * @param {Object} obj The object to lookup events on.
 * @param {String} eventName The name of the event to listen on.
 * @param {Function} cb The callback function.
 */
function listen(obj, eventName, cb) {
  var knownCallbacks = getObjCallbacks_(obj);

  if ('undefined' === typeof knownCallbacks[eventName]) {
    knownCallbacks[eventName] = [];
  }

  if (indexOf(knownCallbacks[eventName], cb) === -1) {
    knownCallbacks[eventName].push(cb);
  }
}

/**
 * Unlisten to an event on an object.
 * @param {Object} obj The object to lookup events on.
 * @param {String} eventName The name of the event to listen on.
 * @param {Function} cb The callback function.
 */
function unlisten(obj, eventName, cb) {
  var knownCallbacks = getObjCallbacks_(obj);

  if ('undefined' === typeof knownCallbacks[eventName]) {
    knownCallbacks[eventName] = [];
    return;
  }

  var idx = indexOf(knownCallbacks[eventName], cb);
  if (idx !== -1) {
    knownCallbacks[eventName].splice(idx, 1);
  }
}

/**
 * Emit an event on an object.
 * @param {Object} obj The object to lookup events on.
 * @param {String} eventName The name of the event to emit on.
 * @param {Object} data Additional event data to pass along.
 */
function emit(obj, eventName, data) {
  var knownCallbacks = getObjCallbacks_(obj);

  if ('undefined' === typeof knownCallbacks[eventName]) {
    knownCallbacks[eventName] = [];
    return;
  }

  for (var i = 0; i < knownCallbacks[eventName].length; i++) {
    var callback = knownCallbacks[eventName][i];

    if ('object' !== typeof data) {
      data = { data: data };
    }

    callback(new Event(eventName, data));
  }
}

/**
 * Make an existing object eventable.
 * @param {Object} obj The object to add functions to.
 * @param {Object} nameMap Custom object event names.
 * @return {Object} The modified object.
 */
function makeEventable(obj, nameMap) {
  var defs = {
    'listen':   function(eventName, cb)   { return listen(this, eventName, cb); },
    'unlisten': function(eventName, cb)   { return unlisten(this, eventName, cb); },
    'emit':     function(eventName, data) { return emit(this, eventName, data); }
  };

  if ('undefined' === typeof nameMap) {
    nameMap = {
      'listen': 'listen',
      'unlisten': 'unlisten',
      'emit': 'emit'
    };
  }

  obj[nameMap['listen']]   = defs['listen'];
  obj[nameMap['unlisten']] = defs['unlisten'];
  obj[nameMap['emit']]     = defs['emit'];

  return obj;
}

export { makeEventable, listen, unlisten, emit };
