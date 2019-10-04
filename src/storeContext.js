import { getContext, setContext } from "svelte";

const STORE_CONTEXT_KEY = "__STORE__";

export const setStoreContext = value => setContext(STORE_CONTEXT_KEY, value);

export const getStoreContext = () => getContext(STORE_CONTEXT_KEY);
