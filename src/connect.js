import { xor, pick } from "lodash";
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

    let stateProps,
      mapStateToProps,
      mapDispatchToProps,
      statePropsKeys,
      dispatchProps,
      dispatchPropsKeys,
      ownPropsKeys;

    const { getState, dispatch, subscribe } = store;
    const instance = new ComponentClass(options);
    const shouldUpdateStatePropsOnOwnPropsChange =
      stateToPropsDraft && stateToPropsDraft.length === 2;
    const shouldUpdateDispatchPropsOnOwnPropsChange =
      dispatchToPropsDraft && dispatchToPropsDraft.length === 2;
    const legacyPropsSetter = instance.$set;

    const customPropsSetter = (ownPropsChange, stateProps, dispatchProps) => {
      if (ownPropsChange) {
        if (
          shouldUpdateStatePropsOnOwnPropsChange ||
          shouldUpdateDispatchPropsOnOwnPropsChange
        ) {
          const ownProps = pick(instance.$$.ctx, ownPropsKeys);

          shouldUpdateStatePropsOnOwnPropsChange &&
            (stateProps = mapStateToProps(getState(), ownProps));
          shouldUpdateDispatchPropsOnOwnPropsChange &&
            (dispatchProps = mapDispatchToProps(dispatch, ownProps));
        }
      }
      console.log(
        "customPropsSetter",
        ownPropsChange,
        stateProps,
        dispatchProps
      );
      legacyPropsSetter({ ...ownPropsChange, ...stateProps, ...dispatchProps });
    };

    if (stateToPropsDraft) {
      // chodzi o to ze keye ustawiam po zbudowaniu stateProps, a zeby je zbudowac juz powinienem przekazac ownProps
      mapStateToProps = mapStateToPropsFactory(stateToPropsDraft);
      stateProps = mapStateToProps(getState());
      statePropsKeys = Object.keys(stateProps);

      const stateChangeHandler = () => {
        const newState = getState();
        const newStateProps = mapStateToProps(newState);

        customPropsSetter(undefined, newStateProps, undefined);
      };

      const unsubscribeStore = subscribe(stateChangeHandler);
      instance.$$.on_destroy.push(unsubscribeStore);
    }

    if (dispatchToPropsDraft) {
      mapDispatchToProps = mapDispatchToPropsFactory(dispatchToPropsDraft);
      dispatchProps = mapDispatchToProps(dispatch);
      dispatchPropsKeys = Object.keys(dispatchProps);
    }

    const connectedProps = [...dispatchPropsKeys, ...statePropsKeys];
    ownPropsKeys = xor(instance.$$.props, connectedProps);

    instance.$set = customPropsSetter;

    customPropsSetter(undefined, stateProps, dispatchProps);
    return instance;
  };

export default connect;
