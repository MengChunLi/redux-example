import expect from 'expect';
import counter from './counter';


describe('counter', function() {
  it('count', function(done) {
    expect(
      counter(0, { type: 'INCREMENT' })
    ).toEqual(1);

    expect(
      counter(1, { type: 'INCREMENT' })
    ).toEqual(2);

    expect(
      counter(2, { type: 'DECREMENT' })
    ).toEqual(1);

    expect(
      counter(1, { type: 'SOMETING_ELSE' })
    ).toEqual(1);

    expect(
      counter(undefined, {})
    ).toEqual(0);

    done();
  });
})