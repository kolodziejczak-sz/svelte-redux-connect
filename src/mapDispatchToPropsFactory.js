import { isFunction, isObject } from "./utils";

const mapDispatchToPropsFactory = draft => {
  if (isFunction(draft)) {
    return draft;
  }

  if (isObject(draft)) {
    return dispatch =>
      Object.entries(draft).reduce((dispatchProps, [key, actionCreator]) => {
        dispatchProps[key] = (...args) => dispatch(actionCreator(...args));

        return dispatchProps;
      }, {});
  }

  console.warn(
    "redux-svelte-connect: mapDispatchToProps is not a function or an object"
  );
};

export default mapDispatchToPropsFactory;
