# svelte-redux
redux binding to svelte

Recreated the solution from react-redux. Purpose of this library is to use redux store instead of svelte one.

Example below
```js
// App.svelte
<script>
  import { StoreProvider } from "svelte-redux";
  import store from "./store.js"; // redux store
  import Info from "./Info";
</script>

<StoreProvider {store}>
  <Info />
</StoreProvider>

// Info/index.js
import { connect } from "svelte-redux";
import { createSelector } from "reselect";
import Info from "./Info.svelte";

const selectTodos = state => state.todos;

const selectCompletedTodos = createSelector(
  todosSelector,
  todos => todos.filter(({ completed}) => completed))
);

const addTodo = (text) => ({
  type: "ADD_TODO",
  text: text
});

const mapStateToProps = {
  todos: selectAllTodos
};

const mapDispatchToProps = {
  addTodo
};

// or by functions
// const mapStateToProps = state => ({
//   todos: selectTodos(state)
// });

// const mapDispatchToProps = dispatch => ({
//  addTodo: (text) => dispatch(addTodo)
// });


export default connect(mapStateToProps, mapDispatchToProps)(Info);
```
