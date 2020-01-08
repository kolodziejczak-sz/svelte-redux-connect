# svelte-redux-connect

Svelte bindings for Redux.
Connect API based on react-redux.

This library let's you use Redux without any constraints or awkward subscription management.
I've recreated the solution from react-redux - the connect API is almost identical.

I'm aware of fact that there's already npm-packages which are trying to accomplish the same goal, but actually I don't think they work as they should be - I tried them and I had to either use the Svelte's store, change API or take care of the store subscription in the body of connected component. This tiny library is the answer to the above problems, and I decided to share it with everyone.

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

If you're interested in docs you can rely on https://react-redux.js.org/api/connect#overview

Although there's little difference:

- theres no support for 2 options fields: forwardRef and pure because the author consider them as React specific. The implementation consider all components as pure in the context of areStatesEqual, areOwnPropsEqual, areStatePropsEqual, areMergedPropsEqual functions behavior.

Feel free to submit any issue or PR.
