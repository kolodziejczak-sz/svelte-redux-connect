import * as utils from "../src/utils";
import connect from "../src/connect";

describe("connect on first call", () => {
  const noop = () => {};
  const stubFalse = () => false;

  it("should return function", () => {
    const firstCallConnect = connect();

    expect(typeof firstCallConnect).toBe("function");
  });

  describe("default props", () => {
    const defaultMergePropsGetter = jest.fn();
    const shallowEqualGetter = jest.fn();
    const strictEqualGetter = jest.fn();
    const stubFalseGetter = jest.fn();

    Object.defineProperties(utils, {
      shallowEqual: { get: shallowEqualGetter },
      strictEqual: { get: strictEqualGetter },
      stubFalse: { get: stubFalseGetter },
      defaultMergeProps: { get: defaultMergePropsGetter }
    });

    beforeEach(jest.resetAllMocks);

    it("if mergeProps is undefined should use defaultMergeProps", () => {
      connect(noop, noop, undefined, { areMergedPropsEqual: stubFalse });
      expect(defaultMergePropsGetter).toHaveBeenCalledTimes(1);
    });

    it("if areStatesEqual is undefined should use strictEqual", () => {
      connect(noop, noop, noop, {
        areMergedPropsEqual: stubFalse,
        areOwnPropsEqual: stubFalse,
        areStatePropsEqual: stubFalse,
        areStatesEqual: undefined
      });

      expect(strictEqualGetter).toHaveBeenCalledTimes(1);
    });

    it("if areStatePropsEqual is undefined should use shallowEqual", () => {
      connect(noop, noop, noop, {
        areMergedPropsEqual: stubFalse,
        areOwnPropsEqual: stubFalse,
        areStatePropsEqual: undefined,
        areStatesEqual: stubFalse
      });

      expect(shallowEqualGetter).toHaveBeenCalledTimes(1);
    });

    it("if areOwnPropsEqual is undefined should use shallowEqual", () => {
      connect(noop, noop, noop, {
        areMergedPropsEqual: stubFalse,
        areOwnPropsEqual: undefined,
        areStatePropsEqual: stubFalse,
        areStatesEqual: stubFalse
      });

      expect(shallowEqualGetter).toHaveBeenCalledTimes(1);
    });

    it("if mergeProps is passed the default areMergedPropsEqual is shallowEqual", () => {
      connect(noop, noop, noop, {
        areMergedPropsEqual: undefined,
        areOwnPropsEqual: noop,
        areStatePropsEqual: noop,
        areStatesEqual: noop
      });

      expect(shallowEqualGetter).toHaveBeenCalledTimes(1);
    });

    it("if mergeProps is not passed the default areMergedPropsEqual is stubFalse", () => {
      connect(noop, noop, undefined, {
        areMergedPropsEqual: undefined,
        areOwnPropsEqual: noop,
        areStatePropsEqual: noop,
        areStatesEqual: noop
      });

      expect(stubFalseGetter).toHaveBeenCalledTimes(1);
    });
  });
});
