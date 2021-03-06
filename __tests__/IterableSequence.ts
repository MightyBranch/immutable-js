///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/Immutable.d.ts'/>
jest.autoMockOff();

import Immutable = require('immutable');


describe('IterableSequence', () => {

  it('creates a sequence from an iterable', () => {
    var i = new SimpleIterable(10);
    var s = Immutable.Sequence(i);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
  })

  it('is stable', () => {
    var i = new SimpleIterable(10);
    var s = Immutable.Sequence(i);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
  })

  it('counts iterations', () => {
    var i = new SimpleIterable(10);
    var s = Immutable.Sequence(i);
    expect(s.forEach(x => x)).toEqual(10);
    expect(s.take(5).forEach(x => x)).toEqual(5);
    expect(s.forEach(x => x < 3)).toEqual(4);
  })

  it('creates a new iterator on every operations', () => {
    var mockFn = jest.genMockFunction();
    var i = new SimpleIterable(3, mockFn);
    var s = Immutable.Sequence(i);
    expect(s.toArray()).toEqual([ 0,1,2 ]);
    expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);
    expect(s.toArray()).toEqual([ 0,1,2 ]);
    expect(mockFn.mock.calls).toEqual([[0],[1],[2],[0],[1],[2]]);
  })

  describe('IteratorSequence', () => {

    it('creates a sequence from a raw iterable', () => {
      var i = new SimpleIterable(10);
      var s = Immutable.Sequence(i['@@iterator']());
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    })

    it('is stable', () => {
      var i = new SimpleIterable(10);
      var s = Immutable.Sequence(i['@@iterator']());
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
    })

    it('counts iterations', () => {
      var i = new SimpleIterable(10);
      var s = Immutable.Sequence(i['@@iterator']());
      expect(s.forEach(x => x)).toEqual(10);
      expect(s.take(5).forEach(x => x)).toEqual(5);
      expect(s.forEach(x => x < 3)).toEqual(4);
    })

    it('memoizes the iterator', () => {
      var mockFn = jest.genMockFunction();
      var i = new SimpleIterable(10, mockFn);
      var s = Immutable.Sequence(i['@@iterator']());
      expect(s.take(3).toArray()).toEqual([ 0,1,2 ]);
      expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);

      // Second call uses memoized values
      expect(s.take(3).toArray()).toEqual([ 0,1,2 ]);
      expect(mockFn.mock.calls).toEqual([[0],[1],[2]]);

      // Further ahead in the iterator yields more results.
      expect(s.take(5).toArray()).toEqual([ 0,1,2,3,4 ]);
      expect(mockFn.mock.calls).toEqual([[0],[1],[2],[3],[4]]);
    })

  })

})


// Helper for this test

function SimpleIterable(max?: number, watcher?: any) {
  this.max = max;
  this.watcher = watcher;
}
SimpleIterable.prototype['@@iterator'] = function() {
  return new SimpleIterator(this);
}

function SimpleIterator(iterable) {
  this.iterable = iterable;
  this.value = 0;
}
SimpleIterator.prototype.next = function() {
  if (this.value >= this.iterable.max) {
    return { value: undefined, done: true };
  }
  this.iterable.watcher && this.iterable.watcher(this.value);
  return { value: this.value++, done: false };
}
SimpleIterator.prototype['@@iterator'] = function() {
  return this;
}
