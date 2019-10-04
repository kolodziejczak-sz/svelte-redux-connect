<script>
  import { setStoreContext } from "./storeContext.js";

  export let value;

  if (value === undefined) {
    console.log("store is undefined. Please provide store as prop.");
  } else {
    setStoreContext(value);
  }
</script>

<slot />
