import { render, createStore } from "./mock";
import { getContext as mockGetContext } from "svelte";

jest.mock("svelte");

describe("connect first render", () => {
    it("should warn and render undefined if store is not provided", () => {
        mockGetContext.mockImplementationOnce(() => undefined);

        const originalWarn = console.warn;
        console.warn = jest.fn();

        const { renderedComponent } = render();
        expect(console.warn).toBeCalledTimes(1);
        expect(renderedComponent).toBe(undefined);

        console.warn = originalWarn;
    });

    it("should render component with correct props when called with defaults args", () => {
        const mockStore = createStore();
        const initialProps = { foo: 1, bar: 2 };

        const { renderedComponent } = render([undefined, undefined, undefined, { context: mockStore }], {
            initialProps
        });

        const expectedPropsKeys = ["state", "dispatch", ...Object.keys(initialProps)].sort();
        const returnedPropsKeys = Object.keys(renderedComponent.options.props).sort();
        expect(returnedPropsKeys).toEqual(expectedPropsKeys);
    });

    it("mapStateToProps should be correctly called", () => {
        const initialState = { baz: 3 };
        const initialOwnProps = { any: 4 };
        const mapStateToProps = jest.fn();
        const mockStore = createStore({
            initialState
        });

        render([mapStateToProps, undefined, undefined, { context: mockStore }], {
            initialProps: initialOwnProps
        });

        expect(mapStateToProps).toBeCalledTimes(1);
        expect(mapStateToProps).toHaveBeenCalledWith(initialState, initialOwnProps);
    });

    it("mapDispatchToProps should be correctly called", () => {
        const initialOwnProps = { any: 4 };
        const mapDispatchToProps = jest.fn(() => {});
        const dispatch = () => {};

        render([undefined, mapDispatchToProps, undefined, { context: createStore({ dispatch }) }], {
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

        const { renderedComponent } = render(
            [mapStateToProps, mapDispatchToProps, mergeProps, { context: createStore() }],
            {
                initialProps: ownProps
            }
        );

        expect(mergeProps).toBeCalledTimes(1);
        expect(mergeProps).toHaveBeenCalledWith(stateProps, dispatchProps, ownProps);
        expect(renderedComponent.options.props).toBe(mergedProps);
    });

    it("should subscribe to store only when mapStateToProps are passed", () => {
        const mapStateToProps = jest.fn();
        const unsub = () => {};
        const subscribe = jest.fn(() => unsub);
        const mockStore = createStore({
            subscribe
        });

        const { renderedComponent } = render([mapStateToProps, undefined, undefined, { context: mockStore }]);
        const onDestroy = renderedComponent.$$.on_destroy;

        expect(onDestroy.indexOf(unsub)).not.toBe(-1);
        expect(subscribe).toBeCalledTimes(1);

        subscribe.mockReset();

        render([undefined, undefined, undefined, { context: mockStore }]);

        expect(subscribe).toBeCalledTimes(0);
    });
});
