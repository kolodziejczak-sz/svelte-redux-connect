import { isFunction } from "lodash";

const mapStateToPropsFactory = draft => (state, ownProps) => {
  if (isFunction(draft)) {
    return draft(state, ownProps);
  } else {
    console.log(
      "mapStateToProps: passed argument supposed to be function or object"
    );
  }
};

export default mapStateToPropsFactory;
