# svelte-redux-connect

Redux binding to Svelte based on react-redux.

I've recreated the solution from react-redux - the connect API is identical.
The Purpose of this library is to use redux store instead of the svelte one - this way you can take advantage of all redux tools.

Example below.

```js
// App.svelte
<script>
  import { StoreProvider } from "this-library";
  import store from "./store.js"; // redux store
  import Todos from "./Todos";
</script>

<StoreProvider {store}>
  <Info />
</StoreProvider>

// Todos/index.js
import { createSelector } from "reselect";
import { connect } from "../lib/src";
import Todos from "./Todos.svelte";

const selectTodos = state => state.todos;

const selectUndoneTodos = createSelector(
  selectTodos,
  todos => todos.filter(t => !t.done)
);

const addTodo = text => ({
  type: "ADD_TODO",
  text
});

const mapStateToProps = {
  todos: selectUndoneTodos
};

const mapDispatchToProps = {
  addTodo
};

// or by functions
// const mapStateToProps = state => ({
//   todos: selectUndoneTodos(state)
// });

// const mapDispatchToProps = dispatch => ({
//   addTodo: text => dispatch(addTodo(text))
// });

export default connect(mapStateToProps, mapDispatchToProps)(Todos);
```
