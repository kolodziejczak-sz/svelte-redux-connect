import connect from "../src/connect";

export const noop = () => {};

export const createStore = ({
    initialState = {},
    state = initialState,
    subs = [],
    getState = () => state,
    setState = val => (state = val),
    dispatch = () => subs.forEach(fn => fn()),
    subscribe = fn => (subs.push(fn), () => (subs = subs.filter(item => item !== fn)))
} = {}) => ({
    getState,
    setState,
    subscribe,
    dispatch
});

export const MockComponent = ({ $set = noop } = {}) =>
    function(options) {
        return {
            $set,
            $$: { on_destroy: [] },
            options
        };
    };

export const render = (
    [mapStateToProps, mapDispatchToProps, mergeProps, connectOptions] = [],
    { initialProps = {}, Component = MockComponent() } = {}
) => {
    const connectContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps, connectOptions);
    const connectedComponent = connectContainer(Component);
    const renderedComponent = connectedComponent({ props: initialProps });

    return renderedComponent;
};
