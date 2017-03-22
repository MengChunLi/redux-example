/**
 * 因為每個Container做的事情很相似，像是subscribe、unsubscribe、透過Context取得store等等
 * 所以這裡透過react-redux提供的Provider和connect處理重複的事情
 */
import { createStore, combineReducers } from 'redux';
import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';

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
let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input type="text" ref={(node) => input = node}/>
      <button onClick={
        () =>  { dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        });
        input.value = '';}
      }>ADD</button>
    </div>
  )
};

//這邊不依賴state只需要dispatch，所以第一個參數不傳表示就不subscribe store了，避免浪費效能
//第二個參數不用傳，因為dispatch很常用，所以他會自動傳dispatch給Container，就不需要手動傳
AddTodo = connect()(AddTodo);

const Todo = ({ text, completed, onToggleClick }) => (
  <li
    onClick={onToggleClick}
    style={{textDecoration: completed? 'line-through' : 'none'}}
    >
    {text}
  </li>
);

//Container
const TodoList = ({ todos, onToggleClick }) =>
  (
    <ul>
      {todos.map(t =>
      <Todo
        key={t.id}
        text={t.text}
        completed={t.completed}
        onToggleClick={() => onToggleClick(t.id)}/>
      )}
    </ul>
  );

//這裡重新命名避免衝突，但是一般Container會分成不同檔案，所以不需要取不同名字
const mapStateToPropsTodoList = (state) => {
  return {
    todos: filterTodos(state.visibilityFilter, state.todos),
  }
};

const mapDispatchToPropsTodoList = (dispatch) => {
  return {
    onToggleClick: (id) => dispatch({ type: 'TOGGLE_TODO', id })
  }
};
//connect() is a curry function
const VisibleTodoList = connect(mapStateToPropsTodoList, mapDispatchToPropsTodoList)(TodoList)

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

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root'));