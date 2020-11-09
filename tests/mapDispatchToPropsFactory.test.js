import mapDispatchToPropsFactory from "../src/mapDispatchToPropsFactory";
import { noop } from "./testUtils";

describe("mapDispatchToPropsFactory", () => {
    it("should return (dispatch) => { dispatch } by default", () => {
        const mapDispatchToProps = mapDispatchToPropsFactory();

        expect(mapDispatchToProps).toBeInstanceOf(Function);
        expect(mapDispatchToProps).toHaveLength(1);
        expect(mapDispatchToProps()).toStrictEqual({ dispatch: undefined });

        const foo = () => {};
        expect(mapDispatchToProps(foo)).toStrictEqual({ dispatch: foo });
    });

    it("should return a passed function when args[0] is not a object", () => {
        const returnValue = mapDispatchToPropsFactory(noop);

        expect(returnValue).toBe(noop);
    });

    describe("mapDispatchToProps arg object", () => {
        const dumbFooAction = { type: "FOO" };
        const dumbBarAction = { type: "BAR" };

        const mapDispatchToPropsObjParam = {
            dumbBarAction,
            dumbFooAction
        };

        it("should return an object with the same keys", () => {
            const mapDispatchToProps = mapDispatchToPropsFactory(mapDispatchToPropsObjParam);
            const dispatchProps = mapDispatchToProps(noop);
            const dispatchPropsKeys = Object.keys(dispatchProps);
            const passedObjectKeys = Object.keys(mapDispatchToPropsObjParam);

            expect(dispatchPropsKeys).toEqual(passedObjectKeys);
        });

        it("should return an object with functions as values", () => {
            const mapDispatchToProps = mapDispatchToPropsFactory(mapDispatchToPropsObjParam);
            const dispatchProps = mapDispatchToProps(noop);
            const dispatchPropsValues = Object.values(dispatchProps);

            dispatchPropsValues.forEach(val => {
                expect(typeof val).toBe("function");
            });
        });

        it("should call dispatch and actionCreator on dispatchedAction", () => {
            const actionCreatorFn = jest.fn();
            const actions = { actionCreatorFn };
            const mapDispatchToProps = mapDispatchToPropsFactory(actions);
            const dispatchFn = jest.fn();
            const dispatchedActions = mapDispatchToProps(dispatchFn);

            const actionNameToDispatch = Object.keys(dispatchedActions)[0];
            dispatchedActions[actionNameToDispatch]();

            expect(dispatchFn).toHaveBeenCalledTimes(1);
            expect(actionCreatorFn).toHaveBeenCalledTimes(1);
        });
    });
});
