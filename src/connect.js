import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";
import { getStoreContext } from "./storeContext";

const connect = (stateToPropsDraft, dispatchToPropsDraft) => ComponentClass =>
  function(options) {
    const store = getStoreContext();

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

    let ownProps = initialProps;
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
        const newStateProps = mapStateToProps(
          newState,
          shouldUpdateStatePropsOnOwnPropsChange ? ownProps : undefined
        );

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
          ownProps = { ...ownProps, ...ownPropsChange };

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
