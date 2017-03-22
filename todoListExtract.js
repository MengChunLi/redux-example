const { createStore, combineReducers } = require('redux');
const ReactDOM = require('react-dom');
import React, { Component } from 'react';

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (action.id !== state.id) {
        return state
      }
      return {...state, completed: !state.completed }
    default:
      return state
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, todo(undefined, action)]
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action))
    default:
      return state
  }
}

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

const todoApp = combineReducers({
  todos,
  visibilityFilter
})
const store = createStore(todoApp);

const InputTodo = ({ onAddClick }) => {
  let input;
  return (
    <div>
    <input type="text" ref={(node) => input = node}/>
    <button onClick={() => {onAddClick(input.value); input.value = '';}}>ADD</button>
  </div>
  )
};
const Todo = ({ text, completed, onToggleClick }) => (
  <li
    onClick={onToggleClick}
    style={{textDecoration: completed? 'line-through' : 'none'}}
    >
    {text}
  </li>
);

const filterTodos = (type, todos) => {
  switch (type) {
    case 'SHOW_ALL':
      return todos;
    case 'COMPLETED':
      return todos.filter(t => t.completed);
    case 'ACTIVE':
      return todos.filter(t => !t.completed);
    default:
      return todos;
  }
}

const FilterLink = ({ filter, visibilityFilter, onFilterClick, children }) => {
  if (visibilityFilter === filter) {
    return <span>{children}</span>
  }
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onFilterClick(filter)}}>{children}</a>
  )
}

const Footer = ({ visibilityFilter, onFilterClick }) => (
  <div>
  <FilterLink 
    filter= "SHOW_ALL"
    visibilityFilter={visibilityFilter}
    onFilterClick={onFilterClick}>
    All
  </FilterLink>
  {' '}
  <FilterLink 
    filter= "COMPLETED"
    visibilityFilter={visibilityFilter}
    onFilterClick={onFilterClick}>
    Completed
  </FilterLink>
  {' '}
  <FilterLink 
    filter= "ACTIVE"
    visibilityFilter={visibilityFilter}
    onFilterClick={onFilterClick}>
    Active
  </FilterLink>
  </div>
)

let nextTodoId = 0;
class TodoApp extends Component {
  render() {
    const { todos, visibilityFilter } = this.props;
    const visibilityTodos = filterTodos(visibilityFilter, todos);
    return <div>
      <InputTodo onAddClick={(text) => {
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text
        });
      }}/>
      <ul>
      {visibilityTodos.map(t =>
        <Todo
          key={t.id}
          text={t.text}
          completed={t.completed}
          onToggleClick={() => store.dispatch({type: 'TOGGLE_TODO', id: t.id})}/>
      )}
      </ul>
      <Footer 
        visibilityFilter={visibilityFilter}
        onFilterClick={(filter) => store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter
        })}/>
    </div>
  }
}

const render = () => ReactDOM.render(<TodoApp {...store.getState()}/>, document.getElementById('root'));

store.subscribe(render);
render()