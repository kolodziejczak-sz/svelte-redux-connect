import { shallowEqual, strictEqual, stubFalse } from "./utils";
import { getContext } from "svelte";
import { STORE_CONTEXT_KEY } from "./constants";
import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";

const defaultMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps
});

const connect = (
  stateToPropsDraft,
  dispatchToPropsDraft,
  mergeProps = defaultMergeProps,
  {
    context,
    areStatesEqual = strictEqual,
    areOwnPropsEqual = shallowEqual,
    areStatePropsEqual = shallowEqual,
    areMergedPropsEqual = mergeProps === defaultMergeProps
      ? stubFalse
      : shallowEqual
  } = {}
) => ComponentClass => {
  const mapStateToProps =
    stateToPropsDraft && mapStateToPropsFactory(stateToPropsDraft);
  const mapDispatchToProps =
    dispatchToPropsDraft && mapDispatchToPropsFactory(dispatchToPropsDraft);

  const shouldMapStateToPropsOnOwnPropsChange =
    mapStateToProps && stateToPropsDraft.length === 2;
  const shouldMapDispatchToPropsOnOwnPropsChange =
    mapDispatchToProps && dispatchToPropsDraft.length === 2;

  return function(options) {
    const store = context || getContext(STORE_CONTEXT_KEY);

    if (!store) {
      console.warn(
        "redux-svelte-connect: store does not exist. Use the <Provider> component or pass the context as an option to the connect function"
      );
      return;
    }

    const { getState, dispatch, subscribe } = store;
    const { props: initialOwnProps } = options;
    const instance = new ComponentClass(options);
    const setProps = instance.$set;

    let state,
      stateProps,
      dispatchProps,
      mergedProps,
      ownProps = initialOwnProps;

    if (mapStateToProps) {
      state = getState();
      stateProps = mapStateToProps(state, initialOwnProps);
    }

    if (mapDispatchToProps) {
      dispatchProps = mapDispatchToProps(dispatch, initialOwnProps);
    }

    const changeProps = () => {
      const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

      if (areMergedPropsEqual(nextMergedProps, mergedProps)) {
        return;
      }

      mergedProps = nextMergedProps;
      setProps(mergedProps);
    };

    const onOwnPropsChange = ownPropsChange => {
      const nextOwnProps = {
        ...ownProps,
        ...ownPropsChange
      };

      if (areOwnPropsEqual(nextOwnProps, ownProps)) {
        return;
      }

      ownProps = nextOwnProps;

      if (shouldMapStateToPropsOnOwnPropsChange) {
        stateProps = mapStateToProps(getState(), ownProps);
      }

      if (shouldMapDispatchToPropsOnOwnPropsChange) {
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
      }

      changeProps();
    };

    const shouldSubscribeToStore = Boolean(mapStateToProps);

    if (shouldSubscribeToStore) {
      const unsubscribe = subscribe(() => {
        const nextState = getState();

        if (areStatesEqual(nextState, state)) {
          return;
        }

        state = nextState;
        const nextStateProps = mapStateToProps(nextState, ownProps);

        if (areStatePropsEqual(nextStateProps, stateProps)) {
          return;
        }

        stateProps = nextStateProps;
        changeProps();
      });

      instance.$$.on_destroy.push(unsubscribe);
    }

    instance.$set = onOwnPropsChange;
    changeProps();

    return instance;
  };
};

export default connect;
