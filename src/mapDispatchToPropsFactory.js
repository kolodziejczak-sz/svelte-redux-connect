import { isFunction, isObject } from "./utils";

const mapDispatchToPropsFactory = draft => dispatch => {
  if (isFunction(draft)) {
    return draft(dispatch);
  }
  if (isObject(draft)) {
    return Object.entries(draft).reduce((props, [key, actionCreator]) => {
      props[key] = (...args) => dispatch(actionCreator(...args));

      return props;
    }, {});
  } else {
    console.log(
      "mapDispatchToProps: Passed argument supposed to be function or object"
    );
  }
};

export default mapDispatchToPropsFactory;
