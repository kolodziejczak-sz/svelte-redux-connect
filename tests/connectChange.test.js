import { render as renderUtil, createStore } from "./testUtils";

const ownProps = { own: true };
const stateProps = { state: true };
const dispatchProps = { dispatch: true };
const mergedProps = { bar: true };

const render = (
    opts,
    mapStateToProps = jest.fn(() => stateProps),
    mapDispatchToProps = jest.fn(() => dispatchProps),
    mergeProps = jest.fn(() => mergedProps),
    store = createStore()
) => {
    const component = renderUtil([mapStateToProps, mapDispatchToProps, mergeProps, { store, ...opts }], {
        initialProps: ownProps
    });

    mapStateToProps.mockClear();
    mapDispatchToProps.mockClear();
    mergeProps.mockClear();

    return {
        ...opts,
        component,
        store,
        mapStateToProps,
        mapDispatchToProps,
        mergeProps,
        mergedProps,
        ownProps,
        stateProps,
        dispatchProps
    };
};

describe("connect onChanges", () => {
    describe("onOwnPropsChange", () => {
        const propsChange = { a: 2 };
        const nextOwnProps = { ...ownProps, ...propsChange };

        it("when ownProps are equal there's no props change", () => {
            const areOwnPropsEqual = jest.fn(() => true);
            const { component, mergeProps } = render({ areOwnPropsEqual });

            component.$set(propsChange);

            expect(areOwnPropsEqual).toBeCalledTimes(1);
            expect(areOwnPropsEqual).toHaveBeenCalledWith(nextOwnProps, ownProps);
            expect(mergeProps).toBeCalledTimes(0);
        });

        it("when ownProps are not equal there's prop change", () => {
            const areOwnPropsEqual = jest.fn(() => false);
            const { component, mergeProps } = render({ areOwnPropsEqual });

            component.$set(propsChange);

            expect(areOwnPropsEqual).toBeCalledTimes(1);
            expect(areOwnPropsEqual).toHaveBeenCalledWith(nextOwnProps, ownProps);
            expect(mergeProps).toBeCalledTimes(1);
        });

        it("calcs stateProps and dispatchProps if drafts have length === 2", () => {
            const areOwnPropsEqual = jest.fn(() => false);
            let mapStateToProps = jest.fn(a => {});
            let mapDispatchToProps = jest.fn(a => {});
            let result = render({ areOwnPropsEqual }, mapStateToProps, mapDispatchToProps);
            let component = result.component;

            component.$set(propsChange);

            expect(mapStateToProps).toBeCalledTimes(0);
            expect(mapDispatchToProps).toBeCalledTimes(0);

            mapStateToProps = jest.fn((a, b) => {});
            mapDispatchToProps = jest.fn((a, b) => {});
            result = render({ areOwnPropsEqual }, mapStateToProps, mapDispatchToProps);
            component = result.component;

            component.$set(propsChange);

            expect(mapStateToProps).toBeCalledTimes(1);
            expect(mapDispatchToProps).toBeCalledTimes(1);
        });
    });

    describe("onStateChange", () => {
        it("if there no state change shouldnt calculate stateProps", () => {
            const areStatesEqual = jest.fn(() => true);
            const { mergeProps, mapStateToProps, store } = render({ areStatesEqual });

            store.dispatch();

            expect(areStatesEqual).toBeCalledTimes(1);
            expect(areStatesEqual).toHaveBeenCalledWith(store.getState(), store.getState());
            expect(mapStateToProps).toBeCalledTimes(0);
            expect(mergeProps).toBeCalledTimes(0);
        });

        it("if there's state change shouldn calculate stateProps", () => {
            const areStatesEqual = jest.fn(() => false);
            const { mapStateToProps, store, ownProps } = render({ areStatesEqual });
            const nextState = { a: 1 };
            const state = store.getState();

            store.setState(nextState);
            store.dispatch();

            expect(areStatesEqual).toBeCalledTimes(1);
            expect(areStatesEqual).toHaveBeenCalledWith(nextState, state);
            expect(mapStateToProps).toBeCalledTimes(1);
            expect(mapStateToProps).toHaveBeenCalledWith(nextState, ownProps);
        });

        it("if there's state props change should call merge props", () => {
            const areStatesEqual = jest.fn(() => false);
            const areStatePropsEqual = jest.fn(() => false);

            const { mapStateToProps, store, ownProps, mergeProps, stateProps, dispatchProps } = render({
                areStatesEqual,
                areStatePropsEqual
            });
            const nextState = { a: 1 };
            store.setState(nextState);
            store.dispatch();

            expect(mapStateToProps).toBeCalledTimes(1);
            expect(mapStateToProps).toHaveBeenCalledWith(nextState, ownProps);
            expect(mergeProps).toBeCalledTimes(1);
            expect(mergeProps).toHaveBeenCalledWith(stateProps, dispatchProps, ownProps);
        });
    });
});
