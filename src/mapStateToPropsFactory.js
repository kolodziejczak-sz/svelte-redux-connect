import { isFunction, isObject } from "./utils";

const mapStateToPropsFactory = draft => state => {
  if (isFunction(draft)) {
    return draft(state);
  }
  if (isObject(draft)) {
    return Object.entries(draft).reduce((props, [key, selector]) => {
      props[key] = selector(state);

      return props;
    }, {});
  } else {
    console.log(
      "mapStateToProps: passed argument supposed to be function or object"
    );
  }
};

export default mapStateToPropsFactory;
