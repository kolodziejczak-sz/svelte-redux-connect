import shallowEqual from "shallowequal";
import { getContext } from "svelte";
import { STORE_CONTEXT_KEY } from "./constants";
import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";

const defaultMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps
});

const strictEqual = (next, prev) => prev === next;

const connect = (
  stateToPropsDraft,
  dispatchToPropsDraft,
  mergeProps = defaultMergeProps,
  {
    context,
    areStatesEqual = strictEqual,
    areOwnPropsEqual = shallowEqual,
    areStatePropsEqual = shallowEqual,
    areMergedPropsEqual = shallowEqual
  } = {}
) => ComponentClass => {
  const mapStateToProps =
    stateToPropsDraft && mapStateToPropsFactory(stateToPropsDraft);
  const mapDispatchToProps =
    dispatchToPropsDraft && mapDispatchToPropsFactory(dispatchToPropsDraft);

  const shouldUpdateStatePropsOnOwnPropsChange =
    mapStateToProps && stateToPropsDraft.length === 2;
  const shouldUpdateDispatchPropsOnOwnPropsChange =
    mapDispatchToProps && dispatchToPropsDraft.length === 2;

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
      mergedProps,
      ownProps = initialOwnProps;

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
          propsSetter(nextStateProps);
        }
      };

      const unsubscribeStore = subscribe(stateChangeHandler);
      instance.$$.on_destroy.push(unsubscribeStore);
    }

    let initialStateProps, initialDispatchProps;

    if (mapStateToProps) {
      state = getState();

      initialStateProps = mapStateToProps(
        state,
        shouldUpdateStatePropsOnOwnPropsChange ? initialOwnProps : undefined
      );
    }

    if (mapDispatchToProps) {
      initialDispatchProps = mapDispatchToProps(
        dispatch,
        shouldUpdateDispatchPropsOnOwnPropsChange ? initialOwnProps : undefined
      );
    }

    instance.$set(
      mergeProps(initialStateProps, initialDispatchProps, initialOwnProps)
    );

    if (
      !shouldUpdateStatePropsOnOwnPropsChange &&
      !shouldUpdateDispatchPropsOnOwnPropsChange
    ) {
      return instance;
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
        nextDispatchProps = mapDispatchToProps(dispatch, ownProps);
      }

      const prevMergedProps = mergedProps;
      const nextMergedProps = (mergedProps = mergeProps(
        nextStateProps,
        nextDispatchProps,
        ownProps
      ));

      if (!areMergedPropsEqual(nextMergedProps, prevMergedProps)) {
        propsSetter(mergedProps);
      }
    };

    instance.$set = propsChangeHandler;

    return instance;
  };
};

export default connect;
