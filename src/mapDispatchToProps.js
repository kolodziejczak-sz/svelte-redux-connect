import { isFunction, isObject } from "./utils";

export default mapDispatchToProps => dispatch => {
  if (isFunction(mapDispatchToProps)) {
    return mapDispatchToProps(dispatch);
  }
  if (isObject(mapDispatchToProps)) {
    return Object.entries(mapDispatchToProps).reduce(
      (props, [key, actionCreator]) => {
        props[key] = (...args) => dispatch(actionCreator(...args));

        return props;
      },
      {}
    );
  } else {
    console.log(
      "mapDispatchToProps: Passed argument supposed to be function or object"
    );
  }
};
