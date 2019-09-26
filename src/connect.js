import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";
import {
  getStore,
  setComponentProps,
  onComponentDestroy
} from "./svelteBindings";

const connect = (stateToPropsDraft, dispatchToPropsDraft) => ComponentClass =>
  function(options) {
    const store = getStore();

    if (!store) {
      console.log("Please provide any store by StoreProvider");
      return;
    }

    const { getState, dispatch, subscribe } = store;
    const instance = new ComponentClass(options);

    if (stateToPropsDraft) {
      const mapStateToProps = mapStateToPropsFactory(stateToPropsDraft);

      const stateChangeHandler = () => {
        const newState = getState();
        const props = mapStateToProps(newState);

        setComponentProps(instance, props);
      };

      const unsubscribeStore = subscribe(stateChangeHandler);

      stateChangeHandler();
      onComponentDestroy(instance, unsubscribeStore);
    }

    if (dispatchToPropsDraft) {
      const mapDispatchToProps = mapDispatchToPropsFactory(
        dispatchToPropsDraft
      );
      const props = mapDispatchToProps(dispatch);

      setComponentProps(instance, props);
    }

    return instance;
  };

export default connect;
