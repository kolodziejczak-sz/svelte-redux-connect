import mapDispatchToPropsFactory from "../src/mapDispatchToPropsFactory";

describe("mapDispatchToPropsFactory", () => {
  console.warn = jest.fn();

  beforeEach(jest.resetAllMocks);

  const noop = () => {};
  const obj = {};

  it("should warn if passed argument is not a function or object", () => {
    mapDispatchToPropsFactory(true);
    mapDispatchToPropsFactory("string");
    mapDispatchToPropsFactory(0);

    expect(console.warn).toHaveBeenCalledTimes(3);
  });

  it("should not warn and return function if passed argument is a function or object", () => {
    const returnValueFn = mapDispatchToPropsFactory(noop);
    const returnValueObj = mapDispatchToPropsFactory(obj);

    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(typeof returnValueFn).toBe("function");
    expect(typeof returnValueObj).toBe("function");
  });

  it("should return a passed function when args[0] is a function", () => {
    const returnValue = mapDispatchToPropsFactory(noop);

    expect(returnValue).toBe(noop);
  });

  describe("mapDispatchToProps when it comes from object call", () => {
    const dumbFooAction = { type: "FOO" };
    const dumbBarAction = { type: "BAR" };

    const mapDispatchToPropsObjParam = {
      dumbBarAction,
      dumbFooAction
    };

    it("should return an object with every value as function", () => {
      const mapDispatchToProps = mapDispatchToPropsFactory(
        mapDispatchToPropsObjParam
      );
      const returnValue = mapDispatchToProps(noop);

      expect(Object.values(returnValue).length).toBe(
        Object.values(mapDispatchToPropsObjParam).length
      );
    });
  });
});
