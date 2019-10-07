import { shallowEqual, strictEqual } from "./utils";
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
  mergeProps,
  {
    context,
    areStatesEqual = strictEqual,
    areOwnPropsEqual = shallowEqual,
    areStatePropsEqual = shallowEqual,
    areMergedPropsEqual = () => false
  } = {}
) => ComponentClass => {
  mergeProps = mergeProps || defaultMergeProps;

  const mapStateToProps =
    stateToPropsDraft && mapStateToPropsFactory(stateToPropsDraft);
  const mapDispatchToProps =
    dispatchToPropsDraft && mapDispatchToPropsFactory(dispatchToPropsDraft);

  const shouldUpdateStatePropsOnOwnPropsChange =
    mapStateToProps && stateToPropsDraft.length === 2;
  const shouldUpdateDispatchPropsOnOwnPropsChange =
    mapDispatchToProps && dispatchToPropsDraft.length === 2;

  const shouldCompareMergedProps = Boolean(mergeProps !== defaultMergeProps);

  if (shouldCompareMergedProps) {
    areMergedPropsEqual = shallowEqual;
  }

  return function(options) {
    const store = context || getContext(STORE_CONTEXT_KEY);

    if (!store) {
      console.warn(
        "redux-svelte-connect: provide any store value by Provider component or by property of options object"
      );
      return;
    }

    const { getState, dispatch, subscribe } = store;
    const { props: initialOwnProps } = options;

    const instance = new ComponentClass(options);

    const propsSetter = instance.$set;

    let state,
      stateProps,
      dispatchProps,
      mergedProps,
      ownProps = initialOwnProps;

    if (mapStateToProps) {
      state = getState();

      stateProps = mapStateToProps(
        state,
        shouldUpdateStatePropsOnOwnPropsChange ? initialOwnProps : undefined
      );
    }

    if (mapDispatchToProps) {
      dispatchProps = mapDispatchToProps(
        dispatch,
        shouldUpdateDispatchPropsOnOwnPropsChange ? initialOwnProps : undefined
      );
    }

    mergedProps = mergeProps(stateProps, dispatchProps, initialOwnProps);

    instance.$set(mergedProps);

    const shouldSubscribeToStore = Boolean(mapStateToProps);

    if (shouldSubscribeToStore) {
      const stateChangeHandler = () => {
        const prevState = state;
        const nextState = (state = getState());

        if (areStatesEqual(nextState, prevState)) {
          return;
        }

        const prevStateProps = stateProps;
        const nextStateProps = (stateProps = mapStateToProps(
          nextState,
          shouldUpdateStatePropsOnOwnPropsChange ? ownProps : undefined
        ));

        if (!areStatePropsEqual(nextStateProps, prevStateProps)) {
          changeProps(nextStateProps, dispatchProps, ownProps);
        }
      };

      const unsubscribeStore = subscribe(stateChangeHandler);
      instance.$$.on_destroy.push(unsubscribeStore);
    }

    const propsChangeHandler = ownPropsChange => {
      const prevOwnProps = ownProps;
      const nextOwnProps = (ownProps = {
        ...prevOwnProps,
        ...ownPropsChange
      });

      if (areOwnPropsEqual(nextOwnProps, prevOwnProps)) {
        return;
      }

      let nextStateProps, nextDispatchProps;

      if (shouldUpdateStatePropsOnOwnPropsChange) {
        nextStateProps = stateProps = mapStateToProps(getState(), ownProps);
      }

      if (shouldUpdateDispatchPropsOnOwnPropsChange) {
        nextDispatchProps = dispatchProps = mapDispatchToProps(
          dispatch,
          ownProps
        );
      }

      changeProps(nextStateProps, nextDispatchProps, nextOwnProps);
    };

    const changeProps = (nextStateProps, nextDispatchProps, nextOwnProps) => {
      const prevMergedProps = mergedProps;
      const nextMergedProps = (mergedProps = mergeProps(
        nextStateProps,
        nextDispatchProps,
        nextOwnProps
      ));

      if (!areMergedPropsEqual(nextMergedProps, prevMergedProps)) {
        propsSetter(nextMergedProps);
      }
    };

    instance.$set = propsChangeHandler;

    return instance;
  };
};

export default connect;
