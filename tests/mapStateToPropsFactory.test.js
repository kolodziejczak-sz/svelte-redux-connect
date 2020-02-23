import mapStateToPropsFactory from "../src/mapStateToPropsFactory";
import { noop } from "../src/utils";

describe("mapStateToPropsFactory", () => {
    it("should return (state) => { state } by default", () => {
        const mapStateToProps = mapStateToPropsFactory();

        expect(mapStateToProps).toBeInstanceOf(Function);
        expect(mapStateToProps).toHaveLength(1);

        expect(mapStateToProps()).toStrictEqual({ state: undefined });

        const foo = () => {};
        expect(mapStateToProps(foo)).toStrictEqual({ state: foo });
    });

    it("should return a passed value", () => {
        const returnValue = mapStateToPropsFactory(noop);

        expect(returnValue).toBe(noop);
    });
});
