import { isFunction } from "./utils";

const mapStateToPropsFactory = draft => (state, ownProps) => {
  if (isFunction(draft)) {
    return draft(state, ownProps);
  } else {
    console.warn(
      "redux-svelte-connect: mapStateToProps supposed to be function"
    );
  }
};

export default mapStateToPropsFactory;
