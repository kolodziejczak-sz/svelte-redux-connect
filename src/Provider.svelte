<script>
  import { setStoreContext } from "./storeContext.js";

  export let value;

  if (value === undefined) {
    console.warn(
      "redux-svelte-connect: store value is undefined. Please provide store as prop called value."
    );
  } else {
    setStoreContext(value);
  }
</script>

<slot />
