import { createStore } from 'redux';
import React from 'react';
import ReactDom from 'react-dom';

const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}

// const createStore = (reducer) => {
//   let state;
//   let listeners = [];
//   const getState = () => state;
//   const dispatch = (action) => {
//     state = reducer(state, action);
//     listeners.forEach(listener => listener());
//   }
//   const subscribe = (listener) => {
//     listeners.push(listener);
//     return listeners.filter(l => l !== listener);
//   };
//   dispatch({}); //初始化
//   return { getState, dispatch, subscribe };
// }

const store = createStore(counter);

const Counter = ({ value }) => (<h1>{value}</h1>);
const render = () => {
  ReactDom.render(<Counter value={store.getState()}/>, document.getElementById('root'));
}

store.subscribe(render);
render();

document.addEventListener('click', () => {
  store.dispatch({ type: 'INCREMENT' });
})

const cancel = () => {
  setTimeout(() => store.subscribe())
}

export default counter;