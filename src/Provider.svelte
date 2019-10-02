<script>
  import { setStore } from "./storeAsContext.js";

  export let value;

  if (value === undefined) {
    console.log("store is undefined. Please provide store as prop.");
  } else {
    setStore(value);
  }
</script>

<slot />
