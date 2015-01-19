var assert = require('assert');
var util = require('core/dom');

describe('DOM tests', function(){
  specify('getViewportWidth', function(){
    var width = util.getViewportWidth();
    assert.equal(width, window.innerWidth, 'PhantomJS window width');
  });

  specify('getViewportHeight', function(){
    var height = util.getViewportHeight();
    assert.equal(height, window.innerHeight, 'PhantomJS window height');
  });

  specify('testMQ', function(){
    var max = window.innerWidth + 100;
    var min = window.innerWidth - 100;
    assert.ok(util.testMQ('(max-width:' + max + 'px)'), 'Test max-width');
    assert.ok(!util.testMQ('(min-width:' + max + 'px)'), 'Test min-width');
    assert.ok(util.testMQ('(min-width:' + min + 'px) and (max-width:' + max + 'px)'), 'Test combo');
  });

  specify('getRect', function() {

    var fakeElem = document.createElement('div');
    fakeElem.id = 'box';
    fakeElem.style.position = 'absolute';
    fakeElem.style.top = '100px';
    fakeElem.style.left = '100px';
    fakeElem.style.width = '100px';
    fakeElem.style.height = '100px';

    document.body.appendChild(fakeElem);

    var elem = document.getElementById('box');

    var rect = util.getRect(elem);

    assert.equal(rect.top, 100, 'Box top');
    assert.equal(rect.left, 100, 'Box left');
  });

});
