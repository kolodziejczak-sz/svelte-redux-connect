<script>
  import { setContext } from "svelte";
  import { STORE_CONTEXT_KEY } from "./storeContext.js";

  export let store;

  if (store === undefined) {
    console.warn(
      "redux-svelte-connect: store value is undefined. Please provide store as prop."
    );
  } else {
    setContext(STORE_CONTEXT_KEY, store);
  }
</script>

<slot />
