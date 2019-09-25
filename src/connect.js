import {
  getStore,
  setComponentProps,
  onComponentDestroy
} from "./svelteBindings";

import mapStateToPropsFactory from "./mapStateToProps";
import mapDispatchToPropsFactory from "./mapDispatchToProps";

const connect = (mapStateToProps, mapDispatchToProps) => Component =>
  function(options) {
    const store = getStore();

    if (!store) {
      console.log("Please provide any store by StoreProvider");
      return;
    }

    const { getState, dispatch, subscribe } = store;
    const instance = new Component(options);

    if (mapStateToProps) {
      const mapFn = mapStateToPropsFactory(mapStateToProps);

      const stateChangeHandler = () => {
        const newState = getState();
        const props = mapFn(newState);
        setComponentProps(instance, props);
      };

      const unsubscribeStore = subscribe(stateChangeHandler);

      stateChangeHandler();
      onComponentDestroy(instance, unsubscribeStore);
    }

    if (mapDispatchToProps) {
      const mapFn = mapDispatchToPropsFactory(mapDispatchToProps);
      const props = mapFn(dispatch);

      setComponentProps(instance, props);
    }

    return instance;
  };

export default connect;
