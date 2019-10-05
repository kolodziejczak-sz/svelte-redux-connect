import isFunction from "lodash.isfunction";
import isObject from "lodash.isobject";

const mapDispatchToPropsFactory = draft => (dispatch, ownProps) => {
  if (isFunction(draft)) {
    return draft(dispatch, ownProps);
  }
  if (isObject(draft)) {
    return Object.entries(draft).reduce((props, [key, actionCreator]) => {
      props[key] = (...args) => dispatch(actionCreator(...args));

      return props;
    }, {});
  } else {
    console.warn(
      "redux-svelte-connect: mapDispatchToProps supposed to be function or object"
    );
  }
};

export default mapDispatchToPropsFactory;
