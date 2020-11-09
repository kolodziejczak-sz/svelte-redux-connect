import { getContext } from "svelte";
import { shallowEqual, strictEqual, stubFalse, defaultMergeProps } from "./utils";
import { STORE_CONTEXT_KEY } from "./constants";
import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";

const connect = (
    stateToPropsDraft,
    dispatchToPropsDraft,
    mergeProps = defaultMergeProps,
    {
        store: storeFromOptions,
        areStatesEqual = strictEqual,
        areOwnPropsEqual = shallowEqual,
        areStatePropsEqual = shallowEqual,
        areMergedPropsEqual = mergeProps === defaultMergeProps ? stubFalse : shallowEqual
    } = {}
) => ComponentClass => {
    const mapStateToProps = mapStateToPropsFactory(stateToPropsDraft);
    const mapDispatchToProps = mapDispatchToPropsFactory(dispatchToPropsDraft);

    const shouldSubscribeToStore = Boolean(stateToPropsDraft);
    const shouldMapStateToPropsOnOwnPropsChange = (mapStateToProps || []).length === 2;
    const shouldMapDispatchToPropsOnOwnPropsChange = (mapDispatchToProps || []).length === 2;

    return function(options) {
        const store = storeFromOptions || getContext(STORE_CONTEXT_KEY);

        if (!store) {
            console.warn(
                "redux-svelte-connect: ",
                "Cannot access the store. Use the <Provider> component or pass the store as an option to the connect function"
            );
            return;
        }

        const { getState, dispatch, subscribe } = store;
        const { props: initialOwnProps } = options;

        let ownProps = initialOwnProps;
        let state = getState();
        let stateProps = mapStateToProps(state, ownProps);
        let dispatchProps = mapDispatchToProps(dispatch, ownProps);
        let mergedProps = mergeProps(stateProps, dispatchProps, ownProps);

        const instance = new ComponentClass({
            ...options,
            props: mergedProps
        });

        const instancePropsSetter = instance.$set.bind(instance);
        instance.$set = handleOwnPropsChange;

        if (shouldSubscribeToStore) {
            const unsubscribe = subscribe(handleStateChange);
            instance.$$.on_destroy.push(unsubscribe);
        }

        function handleOwnPropsChange(ownPropsChange) {
            const nextOwnProps = {
                ...ownProps,
                ...ownPropsChange
            };

            const hasOwnPropsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
            ownProps = nextOwnProps;

            if (!hasOwnPropsChanged) {
                return;
            }

            if (shouldMapStateToPropsOnOwnPropsChange) {
                stateProps = mapStateToProps(getState(), ownProps);
            }

            if (shouldMapDispatchToPropsOnOwnPropsChange) {
                dispatchProps = mapDispatchToProps(dispatch, ownProps);
            }

            handleNewProps();
        }

        function handleStateChange() {
            const nextState = getState();
            const hasStateChanged = !areStatesEqual(nextState, state);
            state = nextState;

            if (!hasStateChanged) {
                return;
            }

            const nextStateProps = mapStateToProps(state, ownProps);
            const hasStatePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
            stateProps = nextStateProps;

            if (hasStatePropsChanged) {
                handleNewProps();
            }
        }

        function handleNewProps() {
            const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);
            const hasMergedPropsChanged = !areMergedPropsEqual(nextMergedProps, mergedProps);
            mergedProps = nextMergedProps;

            if (hasMergedPropsChanged) {
                instancePropsSetter(mergedProps);
            }
        }

        return instance;
    };
};

export default connect;
