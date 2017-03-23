/**
 * 把每個dispatch的action分離出來，方便做測試
 */
import { createStore, combineReducers } from 'redux';
import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';

/** Reducers **/
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

/** Actions **/
let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}

const setFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}


//Container
let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input type="text" ref={(node) => input = node}/>
      <button onClick={
        () =>  { dispatch(addTodo(input.value));
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
    onToggleClick: (id) => dispatch(toggleTodo(id))
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

//第二個參數傳props
const mapStateToPropsLink = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}

const mapDispatchToPropsLink = (dispatch, ownProps) => {
  return {
    onFilterClick: () => {
      dispatch(setFilter(ownProps.filter))
    }
  }
}

const FilterLink = connect(mapStateToPropsLink, mapDispatchToPropsLink)(Link);

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