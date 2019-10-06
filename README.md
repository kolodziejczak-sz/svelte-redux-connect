# svelte-redux-connect

Redux binding to Svelte based on react-redux.

I've recreated the solution from react-redux - the connect API is almost identical.
The main goal of this library is making use of redux store instead of the svelte one - this way you can take advantage of all redux tools.

I'm aware that there's already npm-packages which are trying to achieve the same goal, but actually I don't think they work as they should be - I tried them and I had to either use Svelte's store, change API or take care of store subscription in the body of connected component. This tiny library is the answer to the above problems and I decided to share it with everyone.

Basic example below.

```js
// App.svelte
<script>
  import { Provider } from "svelte-redux-connect";
  import store from "./store.js"; // redux store
  import Todos from "./Todos";
</script>

<Provider {store}>
  <Todos />
</Provider>

// Todos/index.js
import { createSelector } from "reselect";
import { connect } from "svelte-redux-connect";
import Todos from "./Todos.svelte";

const selectTodos = state => state.todos;

const selectUndoneTodos = createSelector(
  selectTodos,
  todos => todos.filter(t => !t.done)
);

const addTodo = text => ({ type: "ADD_TODO", text });

const mapStateToProps = state => ({
  todos: selectUndoneTodos(state)
});

const mapDispatchToProps = {
  addTodo
};

export default connect(mapStateToProps, mapDispatchToProps)(Todos);


// Todos/Todos.svelte
<script>
  export let addTodo = () => {};
  export let todos = [];

  let text = "";
</script>

<input bind:value={text} />
<button on:click={() => addTodo(text)}>add todo</button>
<ul>
  {#each todos as t}
    <li>{t}</li>
  {/each}
</ul>
```

If you're interest in docs you're free to base on https://react-redux.js.org/api/connect#overview
Although there's little difference:

- theres no support for 2 options fields: forwardRef and pure because author consider them as React specific.
