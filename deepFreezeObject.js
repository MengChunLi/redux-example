/**
 * babel-node deepFreezeObject.js 
 */

const expect = require('expect');
const deepFreeze = require('deep-freeze');

function toggleTodo(todo) {
  // return Object.assign({}, todo, { completed: !todo.completed })
  return {...todo, completed: !todo.completed }
}

function testToggleTodo() {
  const todoBefore = {
    id: 0,
    text: 'Learn Redux',
    completed: false
  };
  const todoAfter = {
    id: 0,
    text: 'Learn Redux',
    completed: true
  };
  deepFreeze(todoBefore);
  expect(toggleTodo(todoBefore)).toEqual(todoAfter);
}

testToggleTodo();

console.log('All tests passed!');