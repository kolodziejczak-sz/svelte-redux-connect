import { uniq, pick } from "lodash";
import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";
import { getStore } from "./storeAsContext";

const connect = (stateToPropsDraft, dispatchToPropsDraft) => ComponentClass =>
  function(options) {
    const store = getStore();

    if (!store) {
      console.log("connect: Please provide any store by StoreProvider");
      return;
    }

    const { getState, dispatch, subscribe } = store;
    const { props: initialProps } = options;

    const instance = new ComponentClass(options);

    const propsSetter = instance.$set;

    const mapStateToProps =
      stateToPropsDraft && mapStateToPropsFactory(stateToPropsDraft);
    const mapDispatchToProps =
      dispatchToPropsDraft && mapDispatchToPropsFactory(dispatchToPropsDraft);

    const shouldUpdateStatePropsOnOwnPropsChange =
      stateToPropsDraft && stateToPropsDraft.length === 2;
    const shouldUpdateDispatchPropsOnOwnPropsChange =
      dispatchToPropsDraft && dispatchToPropsDraft.length === 2;

    let ownPropsKeys = Object.keys(initialProps);
    let stateProps, dispatchProps;

    if (mapStateToProps) {
      stateProps = mapStateToProps(
        getState(),
        shouldUpdateStatePropsOnOwnPropsChange ? initialProps : undefined
      );
    }

    if (mapDispatchToProps) {
      dispatchProps = mapDispatchToProps(
        dispatch,
        shouldUpdateDispatchPropsOnOwnPropsChange ? initialProps : undefined
      );
    }

    const shouldSubscribeToStore = Boolean(mapStateToProps);

    if (shouldSubscribeToStore) {
      const stateChangeHandler = () => {
        const newState = getState();
        const ownProps = shouldUpdateStatePropsOnOwnPropsChange
          ? pick(instance.$$.ctx, ownPropsKeys)
          : undefined;

        const newStateProps = mapStateToProps(newState, ownProps);

        propsChangeHandler(undefined, newStateProps, undefined);
      };

      const unsubscribeStore = subscribe(stateChangeHandler);
      instance.$$.on_destroy.push(unsubscribeStore);
    }

    const propsChangeHandler = (ownPropsChange, stateProps, dispatchProps) => {
      if (ownPropsChange) {
        if (
          shouldUpdateStatePropsOnOwnPropsChange ||
          shouldUpdateDispatchPropsOnOwnPropsChange
        ) {
          ownPropsKeys = uniq([...ownPropsKeys, ...ownPropsChange]);

          const ownProps = pick(instance.$$.ctx, ownPropsKeys);

          if (shouldUpdateStatePropsOnOwnPropsChange) {
            stateProps = mapStateToProps(getState(), ownProps);
          }

          if (shouldUpdateDispatchPropsOnOwnPropsChange) {
            dispatchProps = mapDispatchToProps(dispatch, ownProps);
          }
        }
      }
      propsSetter({ ...ownPropsChange, ...stateProps, ...dispatchProps });
    };

    instance.$set = propsChangeHandler;

    propsChangeHandler(undefined, stateProps, dispatchProps);

    return instance;
  };

export default connect;
