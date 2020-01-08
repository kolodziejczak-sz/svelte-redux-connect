import { isFunction } from "./utils";

const mapStateToPropsFactory = draft => {
  if (isFunction(draft)) {
    return draft;
  }

  console.warn("redux-svelte-connect: mapStateToProps is not a function");
};

export default mapStateToPropsFactory;
