import * as utils from "../src/utils";
import * as mapStateToPropsFactory from "../src/mapStateToPropsFactory";
import * as mapDispatchToPropsFactory from "../src/mapDispatchToPropsFactory";
import connect from "../src/connect";

describe("connect second call", () => {
  const noop = () => {};

  beforeEach(jest.resetAllMocks);

  it("should return function", () => {
    expect(typeof connect()()).toBe("function");
  });

  it("should create stack for initialSetProps", () => {
    utils.stack = jest.fn();

    connect()();

    expect(utils.stack).toHaveBeenCalledTimes(1);
  });

  it("should call mapStateToPropsFactory with draft when draft is not falsy", () => {
    const draft = jest.fn();
    mapStateToPropsFactory.default = jest.fn();

    connect(draft)(noop);

    expect(mapStateToPropsFactory.default).toHaveBeenCalledTimes(1);
    expect(mapStateToPropsFactory.default).toHaveBeenCalledWith(draft);
  });

  it("should call mapDispatchToPropsFactory with draft when draft is not falsy", () => {
    const draft = jest.fn();
    mapDispatchToPropsFactory.default = jest.fn();

    connect(false, draft)(noop);

    expect(mapDispatchToPropsFactory.default).toHaveBeenCalledTimes(1);
    expect(mapDispatchToPropsFactory.default).toHaveBeenCalledWith(draft);
  });

  it("should not call mapStateToPropsFactory with draft when draft is falsy", () => {
    mapStateToPropsFactory.default = jest.fn();

    connect(false, false)(noop);

    expect(mapStateToPropsFactory.default).toHaveBeenCalledTimes(0);
  });

  it("should not call mapDispatchToPropsFactory with draft when draft is falsy", () => {
    mapDispatchToPropsFactory.default = jest.fn();

    connect(false, false)(noop);

    expect(mapDispatchToPropsFactory.default).toHaveBeenCalledTimes(0);
  });
});
