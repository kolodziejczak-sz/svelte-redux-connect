import { getContext } from "svelte";
import { shallowEqual, strictEqual, stubFalse, noop, defaultMergeProps } from "./utils";
import { STORE_CONTEXT_KEY } from "./constants";
import mapStateToPropsFactory from "./mapStateToPropsFactory";
import mapDispatchToPropsFactory from "./mapDispatchToPropsFactory";

const connect = (
    stateToPropsDraft,
    dispatchToPropsDraft,
    mergeProps = defaultMergeProps,
    {
        context,
        areStatesEqual = strictEqual,
        areOwnPropsEqual = shallowEqual,
        areStatePropsEqual = shallowEqual,
        areMergedPropsEqual = mergeProps === defaultMergeProps ? stubFalse : shallowEqual
    } = {}
) => ComponentClass => {
    const mapStateToProps = mapStateToPropsFactory(stateToPropsDraft);
    const mapDispatchToProps = mapDispatchToPropsFactory(dispatchToPropsDraft);

    const shouldSubscribeToStore = Boolean(stateToPropsDraft);
    const shouldMapStateToPropsOnOwnPropsChange = (mapStateToProps || {}).length === 2;
    const shouldMapDispatchToPropsOnOwnPropsChange = (mapDispatchToProps || {}).length === 2;

    return function(options) {
        const store = context || getContext(STORE_CONTEXT_KEY);

        if (!store) {
            console.warn(
                "redux-svelte-connect: ",
                "Cannot access the store. Use the <Provider> component or pass the context as an option to the connect function"
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

        let instancePropsSetter = noop;

        const instance = new ComponentClass({
            ...options,
            props: mergedProps
        });

        instancePropsSetter = instance.$set;

        if (shouldSubscribeToStore) {
            const unsubscribe = subscribe(handleStateChange);
            instance.$$.on_destroy.push(unsubscribe);
        }

        instance.$set = handleOwnPropsChange;

        function handleNewProps() {
            const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);
            const hasMergedPropsChanged = !areMergedPropsEqual(nextMergedProps, mergedProps);
            mergedProps = nextMergedProps;

            if (hasMergedPropsChanged) {
                instancePropsSetter(mergedProps);
            }
        }

        function handleOwnPropsChange(ownPropsChange) {
            const nextOwnProps = {
                ...ownProps,
                ...ownPropsChange
            };

            const hasOwnPropsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
            if (!hasOwnPropsChanged) {
                return;
            }

            ownProps = nextOwnProps;

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

            if (!hasStateChanged) {
                return;
            }

            state = nextState;
            const nextStateProps = mapStateToProps(state, ownProps);
            const hasStatePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);

            if (hasStatePropsChanged) {
                stateProps = nextStateProps;
                handleNewProps();
            }
        }

        return instance;
    };
};

export default connect;
