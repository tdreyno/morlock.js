var assert = require('assert');
var buffer = require('../core/buffer');

describe('Buffer tests', function() {

  specify('len', function() {
    var b = buffer.create(8, 'sliding');
    assert.equal(buffer.len(b), 0, 'Empty buffer');
  });

  specify('len (singleValue)', function() {
    var b = buffer.create(1, 'sliding');
    assert.equal(buffer.len(b), 0, 'Empty buffer');
  });

  specify('push (empty, sliding)', function() {
    var b = buffer.create(2, 'sliding');
    assert.equal(buffer.len(b), 0, 'Empty buffer');

    buffer.push(b, 'hi1');

    assert.equal(buffer.len(b), 1, 'One item');

    buffer.push(b, 'hi2');
    
    assert.equal(buffer.len(b), 2, 'Two items');

    buffer.push(b, 'hi3');
    
    assert.equal(buffer.len(b), 2, 'Two items');
    assert.deepEqual(b.values, ['hi2', 'hi3'], 'New array should be: ["hi2", "hi3"]');
  });

  specify('push (empty, dropping)', function() {
    var b = buffer.create(2, 'dropping');
    assert.equal(buffer.len(b), 0, 'Empty buffer');

    buffer.push(b, 'hi1');

    assert.equal(buffer.len(b), 1, 'One item');

    buffer.push(b, 'hi2');
    
    assert.equal(buffer.len(b), 2, 'Two items');

    buffer.push(b, 'hi3');
    
    assert.equal(buffer.len(b), 2, 'Two items');
    assert.deepEqual(b.values, ['hi1', 'hi2'], 'New array should be: ["hi1", "hi2"]');
  });

  specify('push (single, sliding)', function() {
    var b = buffer.create(1, 'sliding');
    assert.equal(buffer.len(b), 0, 'Empty buffer');

    buffer.push(b, 'hi1');

    assert.equal(buffer.len(b), 1, 'One item');

    buffer.push(b, 'hi2');
    
    assert.equal(buffer.len(b), 1, 'One item');
    assert.equal(b.singleValue, 'hi2', 'New value should be: "hi2"');
  });

  specify('push (single, dropping)', function() {
    var b = buffer.create(1, 'dropping');
    assert.equal(buffer.len(b), 0, 'Empty buffer');

    buffer.push(b, 'hi1');

    assert.equal(buffer.len(b), 1, 'One item');

    buffer.push(b, 'hi2');
    
    assert.equal(buffer.len(b), 1, 'One item');
    assert.equal(b.singleValue, 'hi1', 'New value should be: "hi1"');
  });

  specify('lastValue (empty, dropping)', function() {
    var b = buffer.create(2, 'dropping');
    assert.equal(buffer.lastValue(b), null, 'Empty lastValue should be: null');
    buffer.push(b, 'hi1');
    buffer.push(b, 'hi2');
    buffer.push(b, 'hi3');
    assert.equal(buffer.lastValue(b), 'hi2', 'Last value should be: "hi2"');
  });

  specify('lastValue (empty, sliding)', function() {
    var b = buffer.create(2, 'sliding');
    assert.equal(buffer.lastValue(b), null, 'Empty lastValue should be: null');
    buffer.push(b, 'hi1');
    buffer.push(b, 'hi2');
    buffer.push(b, 'hi3');
    assert.equal(buffer.lastValue(b), 'hi3', 'Last value should be: "hi3"');
  });

  specify('lastValue (single, dropping)', function() {
    var b = buffer.create(1, 'dropping');
    assert.equal(buffer.lastValue(b), null, 'Empty lastValue should be: null');
    buffer.push(b, 'hi1');
    buffer.push(b, 'hi2');
    assert.equal(buffer.lastValue(b), 'hi1', 'Last value should be: "hi1"');
  });

  specify('lastValue (single, sliding)', function() {
    var b = buffer.create(1, 'sliding');
    assert.equal(buffer.lastValue(b), null, 'Empty lastValue should be: null');
    buffer.push(b, 'hi1');
    buffer.push(b, 'hi2');
    assert.equal(buffer.lastValue(b), 'hi2', 'Last value should be: "hi2"');
  });

  specify('fill', function() {
    var b = buffer.create(2, 'dropping');
    buffer.fill(b, 1);
    assert.deepEqual(b.values, [1, 1], 'New array should be: [1, 1]');
  });

  specify('fill (single)', function() {
    var b = buffer.create(1, 'dropping');
    buffer.fill(b, 1);
    assert.equal(b.singleValue, 1, 'New value should be: 1');
  });

  specify('sum', function() {
    var b = buffer.create(3, 'dropping');
    buffer.fill(b, 2);
    assert.equal(buffer.sum(b), 6, 'Sum should be 6');
  });

  specify('sum (single)', function() {
    var b = buffer.create(1, 'dropping');
    buffer.fill(b, 2);
    assert.equal(buffer.sum(b), 2, 'Sum should be 2');
  });

  specify('average', function() {
    var b = buffer.create(3, 'dropping');
    buffer.fill(b, 2);
    assert.equal(buffer.average(b), 2, 'Average should be 2');
  });

  specify('average (single)', function() {
    var b = buffer.create(1, 'dropping');
    buffer.fill(b, 2);
    assert.equal(buffer.average(b), 2, 'Average should be 2');
  });

  specify('clear', function() {
    var b = buffer.create(3, 'dropping');
    buffer.fill(b, 2);
    buffer.clear(b);
    assert.equal(b.values, null, 'Values should be empty');
  });

  specify('clear (single)', function() {
    var b = buffer.create(1, 'dropping');
    buffer.clear(b);
    assert.equal(b.singleValue, null, 'Value should be empty');
  });
});
