/**
 * Root: 透過TodoApp把store傳遞下去，卻發生每個Container都要透過this.props.store取得並往下傳遞，相當麻煩
 * 所以這裡透過Context的方法，可以繞過中間經過的元件(例如這裡的TodoApp和Footer)，直達裡面某個你想要傳遞的Container(就像蟲洞一樣!)
 * But!!!Context造成資料流不明確，並且產生global variable，使用時須注意。
 */
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

//Container
let nextTodoId = 0;
const AddTodo = (props, { store }) => {
  const state = store.getState();
  let input;
  return (
    <div>
      <input type="text" ref={(node) => input = node}/>
      <button onClick={
        () =>  { store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        });
        input.value = '';}
      }>ADD</button>
    </div>
  )
};
//必須宣告PropTypes不然抓不到context
AddTodo.contextTypes = {
  store: React.PropTypes.object
}
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
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()
    })
  }
  componentWillUnMount() {
    this.unsubscribe()
  }
  render() {
    const props = this.props;
    const { store } = this.context;
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
VisibleTodoList.contextTypes = {
  store: React.PropTypes.object
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
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()
    })
  }
  componentWillUnMount() {
    this.unsubscribe()
  }
  render() {
    const props = this.props;
    const { store } = this.context;
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
FilterLink.contextTypes = {
  store: React.PropTypes.object
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

class Provider extends Component {
  getChildContext() {
    return {
      store: this.props.store
    }
  }
  render() {
    return this.props.children
  }
}
Provider.childContextTypes = {
  store: React.PropTypes.object
}

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root'));