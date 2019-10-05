import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";
import { getStoreContext } from "./storeContext";

const defaultMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps
});

const defaultAreStatesEqual = (nextState, prevState) => {
  return prevState === nextState;
};

const FalseBecauseSvelteWillHandleIt = () => false;

const connect = (
  stateToPropsDraft,
  dispatchToPropsDraft,
  mergeProps = defaultMergeProps,
  {
    context,
    areStatesEqual = defaultAreStatesEqual,
    areOwnPropsEqual = FalseBecauseSvelteWillHandleIt,
    areStatePropsEqual = FalseBecauseSvelteWillHandleIt,
    areMergedPropsEqual = FalseBecauseSvelteWillHandleIt
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
    const store = context || getStoreContext();

    if (!store) {
      console.log(
        "connect: Please provide any store by Provider or by connect options object"
      );
      return;
    }

    const { getState, dispatch, subscribe } = store;
    const { props: initialProps } = options;

    const instance = new ComponentClass(options);

    const propsSetter = instance.$set;

    let state,
      stateProps,
      mergedProps,
      ownProps = initialProps;

    const propsChangeHandler = (
      ownPropsChange,
      nextStateProps,
      nextDispatchProps
    ) => {
      if (nextStateProps) {
        const prevStateProps = stateProps;
        stateProps = nextStateProps;

        if (areStatePropsEqual(nextStateProps, prevStateProps)) {
          return;
        }
      }

      if (ownPropsChange) {
        const prevOwnProps = ownProps;
        const nextOwnProps = (ownProps = {
          ...prevOwnProps,
          ...ownPropsChange
        });

        if (areOwnPropsEqual(nextOwnProps, prevOwnProps)) {
          return;
        }

        if (shouldUpdateStatePropsOnOwnPropsChange) {
          nextStateProps = stateProps = mapStateToProps(getState(), ownProps);
        }

        if (shouldUpdateDispatchPropsOnOwnPropsChange) {
          nextDispatchProps = mapDispatchToProps(dispatch, ownProps);
        }
      }

      const prevMergedProps = mergedProps;
      const nextMergedProps = (mergedProps = mergeProps(
        nextStateProps,
        nextDispatchProps,
        ownProps
      ));

      if (areMergedPropsEqual(nextMergedProps, prevMergedProps)) {
        return;
      }

      propsSetter(mergedProps);
    };

    const shouldSubscribeToStore = Boolean(mapStateToProps);

    if (shouldSubscribeToStore) {
      const stateChangeHandler = () => {
        const prevState = state;
        const nextState = (state = getState());

        if (areStatesEqual(nextState, prevState)) {
          return;
        }

        const nextStateProps = (stateProps = mapStateToProps(
          nextState,
          shouldUpdateStatePropsOnOwnPropsChange ? ownProps : undefined
        ));

        propsChangeHandler(undefined, nextStateProps, undefined);
      };

      const unsubscribeStore = subscribe(stateChangeHandler);
      instance.$$.on_destroy.push(unsubscribeStore);
    }

    let initialStateProps, initialDispatchProps;

    if (mapStateToProps) {
      state = getState();

      initialStateProps = mapStateToProps(
        state,
        shouldUpdateStatePropsOnOwnPropsChange ? initialProps : undefined
      );
    }

    if (mapDispatchToProps) {
      initialDispatchProps = mapDispatchToProps(
        dispatch,
        shouldUpdateDispatchPropsOnOwnPropsChange ? initialProps : undefined
      );
    }

    propsChangeHandler(undefined, initialStateProps, initialDispatchProps);

    instance.$set = propsChangeHandler;

    return instance;
  };
};

export default connect;
