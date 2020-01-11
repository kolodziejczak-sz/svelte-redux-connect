import mapStateToPropsFactory from "../src/mapStateToPropsFactory";

describe("mapStateToPropsFactory", () => {
  console.warn = jest.fn();

  beforeEach(jest.resetAllMocks);

  it("should warn and return undefined if passed argument is not a function", () => {
    const returnValue = mapStateToPropsFactory();

    expect(returnValue).toBe(undefined);
    expect(console.warn).toHaveBeenCalled();
  });

  it("should return a passed function without warn when args are fine", () => {
    const noop = () => {};
    const returnValue = mapStateToPropsFactory(noop);

    expect(returnValue).toBe(noop);
    expect(console.warn).toHaveBeenCalledTimes(0);
  });
});
