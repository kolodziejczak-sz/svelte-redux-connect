<script>
  import { setStore } from "./svelteBindings.js";

  export let store;

  if (store === undefined) {
    console.log("store is undefined. Please provide store as prop.");
  } else {
    setStore(store);
  }
</script>

<slot />
