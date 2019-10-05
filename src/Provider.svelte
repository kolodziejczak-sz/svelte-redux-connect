<script>
  import { setStoreContext } from "./storeContext.js";

  export let store;

  if (store === undefined) {
    console.warn(
      "redux-svelte-connect: store value is undefined. Please provide store as prop."
    );
  } else {
    setStoreContext(store);
  }
</script>

<slot />
