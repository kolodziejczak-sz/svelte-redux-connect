import { isFunction, isObject } from "./utils";

export default mapStateToProps => state => {
  if (isFunction(mapStateToProps)) {
    return mapStateToProps(state);
  }
  if (isObject(mapStateToProps)) {
    return Object.entries(mapStateToProps).reduce((props, [key, selector]) => {
      props[key] = selector(state);

      return props;
    }, {});
  } else {
    console.log(
      "mapStateToProps: passed argument supposed to be function or object"
    );
  }
};
