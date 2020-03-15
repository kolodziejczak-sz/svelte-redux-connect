import { render, createStore } from "./testUtils";
import { getContext as mockGetContext } from "svelte";

jest.mock("svelte");

describe("connect first render", () => {
    it("should warn and render undefined if store is not provided", () => {
        mockGetContext.mockImplementationOnce(() => undefined);
        const originalWarn = console.warn;
        console.warn = jest.fn();

        const component = render();

        expect(console.warn).toBeCalledTimes(1);
        expect(component).toBe(undefined);

        console.warn = originalWarn;
    });

    it("should render component with correct props when called with defaults args", () => {
        const mockStore = createStore();
        const initialProps = { foo: 1, bar: 2 };

        const component = render([undefined, undefined, undefined, { store: mockStore }], {
            initialProps
        });

        const expectedPropsKeys = ["state", "dispatch", ...Object.keys(initialProps)].sort();
        const returnedPropsKeys = Object.keys(component.options.props).sort();
        expect(returnedPropsKeys).toEqual(expectedPropsKeys);
    });

    it("mapStateToProps should be correctly called", () => {
        const initialState = { baz: 3 };
        const initialOwnProps = { any: 4 };
        const mapStateToProps = jest.fn();
        const mockStore = createStore({
            initialState
        });

        render([mapStateToProps, undefined, undefined, { store: mockStore }], {
            initialProps: initialOwnProps
        });

        expect(mapStateToProps).toBeCalledTimes(1);
        expect(mapStateToProps).toHaveBeenCalledWith(initialState, initialOwnProps);
    });

    it("mapDispatchToProps should be correctly called", () => {
        const initialOwnProps = { any: 4 };
        const mapDispatchToProps = jest.fn(() => {});
        const dispatch = () => {};

        render([undefined, mapDispatchToProps, undefined, { store: createStore({ dispatch }) }], {
            initialProps: initialOwnProps
        });

        expect(mapDispatchToProps).toBeCalledTimes(1);
        expect(mapDispatchToProps).toHaveBeenCalledWith(dispatch, initialOwnProps);
    });

    it("mergeProps should be correctly called and passed to Component", () => {
        const ownProps = { own: true };
        const stateProps = { state: true };
        const dispatchProps = { dispatch: true };
        const mergedProps = { bar: true };

        const mapStateToProps = jest.fn(() => stateProps);
        const mapDispatchToProps = jest.fn(() => dispatchProps);
        const mergeProps = jest.fn(() => mergedProps);

        const component = render([mapStateToProps, mapDispatchToProps, mergeProps, { store: createStore() }], {
            initialProps: ownProps
        });

        expect(mergeProps).toBeCalledTimes(1);
        expect(mergeProps).toHaveBeenCalledWith(stateProps, dispatchProps, ownProps);
        expect(component.options.props).toBe(mergedProps);
    });

    it("should subscribe to store only when mapStateToProps are passed", () => {
        const mapStateToProps = jest.fn();
        const unsub = () => {};
        const subscribe = jest.fn(() => unsub);
        const mockStore = createStore({ subscribe });

        const component = render([mapStateToProps, undefined, undefined, { store: mockStore }]);
        const onDestroy = component.$$.on_destroy;

        expect(onDestroy.indexOf(unsub)).not.toBe(-1);
        expect(subscribe).toBeCalledTimes(1);

        subscribe.mockClear();

        render([undefined, undefined, undefined, { store: mockStore }]);

        expect(subscribe).toBeCalledTimes(0);
    });
});
