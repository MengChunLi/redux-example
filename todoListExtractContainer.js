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

//component
const AddTodoComp = ({ onClick }) => {
  let input;
  return <div>
    <input type="text" ref={(node) => input = node}/>
    <button onClick={() => {onClick(input); input.value = '';}}>ADD</button>
  </div>
};

//Container
let nextTodoId = 0;
class AddTodo extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()
    })
  }
  componentWillUnMount() {
    this.unsubscribe()
  }
  render() {
    const props = this.props;
    const state = store.getState();
    return (
      <div>
      <AddTodoComp onClick={ input => 
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        })
      } />
      </div>
    )
  }
};
const Todo = ({ text, completed, onToggleClick }) => (
  <li
    onClick={onToggleClick}
    style={{textDecoration: completed? 'line-through' : 'none'}}
    >
    {text}
  </li>
);

//Container
class VisibleTodoList extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()
    })
  }
  componentWillUnMount() {
    this.unsubscribe()
  }
  render() {
    const props = this.props;
    const state = store.getState();
    const visibilityTodos = filterTodos(state.visibilityFilter, state.todos);
    return (
      <ul>
        {visibilityTodos.map(t =>
        <Todo
          key={t.id}
          text={t.text}
          completed={t.completed}
          onToggleClick={() => store.dispatch({type: 'TOGGLE_TODO', id: t.id})}/>
        )}
      </ul>
    );
  }
}

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

//Component
const Link = ({ active, onFilterClick, children }) => {
  if (active) {
    return <span>{children}</span>
  }
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onFilterClick()}}>{children}</a>
  )
}

//Container
class FilterLink extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()
    })
  }
  componentWillUnMount() {
    this.unsubscribe()
  }
  render() {
    const props = this.props;
    const state = store.getState();
    return <div>
    <Link 
    active={ props.filter === state.visibilityFilter }
    onFilterClick={filter => store.dispatch({
      type: 'SET_VISIBILITY_FILTER',
      filter: props.filter
    })}>{ props.children }</Link></div>
  }
}

//Container
const Footer = () => (
  <div>
  <FilterLink 
    filter="SHOW_ALL">
    All
  </FilterLink>
  {' '}
  <FilterLink 
    filter="COMPLETED">
    Completed
  </FilterLink>
  {' '}
  <FilterLink 
    filter="ACTIVE">
    Active
  </FilterLink>
  </div>
)

const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)

ReactDOM.render(<TodoApp />, document.getElementById('root'));