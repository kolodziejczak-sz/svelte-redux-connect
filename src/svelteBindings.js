import { getContext, setContext } from "svelte";

const STORE_CONTEXT_KEY = "__STORE__";

export const setStore = value => setContext(STORE_CONTEXT_KEY, value);

export const getStore = () => getContext(STORE_CONTEXT_KEY);

export const setComponentProps = (comp, props) => comp.$set(props);

export const onComponentDestroy = (comp, fn) => comp.$$.on_destroy.push(fn);
