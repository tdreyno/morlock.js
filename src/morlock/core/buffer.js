/**
 * Ghetto Record implementation.
 */
function Buffer(max, mode) {
  if (!(this instanceof Buffer)) {
    return new Buffer(max);
  }

  this.max = max;
  this.singleValueMode = this.max === 1;

  this.mode = mode;

  this.values = null;

  // Single item optimization
  this.singleValue = null; 
}

export function create(max, mode) {
  return new Buffer(max, mode);
}

export function len(buffer) {
  if (buffer.singleValueMode) {
    return buffer.singleValue ? 1 : 0;
  } else {
    return buffer.values ? buffer.values.length : 0;
  }
}

export function push(buffer, value) {
  if (len(buffer) === buffer.max) {
    if (!buffer.singleValueMode && ('sliding' === buffer.mode)) {
      buffer.values.shift();
    } else if ('dropping' === buffer.mode) {
      return;
    }
  }

  if (buffer.singleValueMode) {
    buffer.singleValue = value;
  } else {
    if (!len(buffer)) {
      buffer.values = [];
    }

    buffer.values.push(value);
  }
}

export function lastValue(buffer) {
  if (buffer.singleValueMode) {
    return buffer.singleValue;
  } else {
    return buffer.values && buffer.values[buffer.values.length - 1];
  }
}

export function fill(buffer, value) {
  if (buffer.singleValueMode) {
    buffer.singleValue = buffer.singleValue || value;
  } else {
    while (!buffer.values || (buffer.values.length < buffer.max)) {
      push(buffer, value);
    }
  }
}

export function sum(buffer) {
  if (buffer.singleValueMode) {
    return buffer.singleValue;
  }

  var total = 0;

  for (var i = 0; buffer.values, i < buffer.values.length; i++) {
    total += buffer.values[i];
  }

  return total;
}

export function average(buffer) {
  if (buffer.singleValueMode) {
    return buffer.singleValue;
  }

  var total = sum(buffer);
  
  if (buffer.values) {
    return buffer.values.length ? (total / buffer.values.length) : 0;
  } else {
    return null;
  }
}

export function clear(buffer) {
  if (buffer.singleValueMode) {
    buffer.singleValue = null;
  } else {
    if (buffer.values) {
      buffer.values.length = 0;
      buffer.values = null;
    }
  }
}
