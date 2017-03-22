/**
 * babel-node deepFreezeArray.js 
 */

const expect = require('expect');
const deepFreeze = require('deep-freeze');

function addCounter(list, el) {
  return [...list, el];
}

function removeCounter(list, index) {
  return [...list.slice(0, index), ...list.slice(index + 1)];
}

function incrementCounter(list, index) {
  return [...list.slice(0, index), list[index] + 1, ...list.slice(index + 1)];
}

function testAddCounter() {
  const listBefore = [];
  const listAfter = [0];
  deepFreeze(listBefore);
  expect(addCounter(listBefore, 0)).toEqual(listAfter);
}

function testRemoveCounter() {
  const listBefore = [1, 2, 10, 20, 50];
  const listAfter = [1, 10, 20, 50];
  deepFreeze(listBefore);
  expect(removeCounter(listBefore, 1)).toEqual(listAfter);
}

function testIncrementCounter() {
  const listBefore = [1, 20, 30];
  const listAfter = [1, 20, 31];
  deepFreeze(listBefore);
  expect(incrementCounter(listBefore, 2)).toEqual(listAfter);
}

testAddCounter();
testRemoveCounter();
testIncrementCounter();
console.log('All tests passed!');