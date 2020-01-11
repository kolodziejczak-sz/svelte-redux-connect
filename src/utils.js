export function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

/**
 * Source: https://github.com/lodash/lodash/blob/master/isObject.js
 * License MIT
 */
export function isObject(value) {
  const type = typeof value;
  return value != null && (type === "object" || type === "function");
}

export function strictEqual(next, prev) {
  return prev === next;
}

/**
 * Simplified code of source: https://github.com/dashed/shallowequal/blob/master/index.js
 * License MIT
 */
export function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

  for (let idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];

    if (!bHasOwnProperty(key)) {
      return false;
    }

    const valueA = objA[key];
    const valueB = objB[key];

    if (valueA !== valueB) {
      return false;
    }
  }

  return true;
}

export function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps
  };
}

export function noop() {}

export function stubFalse() {
  return false;
}

export function stack() {
  let value;

  const pop = () => {
    const returnVal = value;
    value = undefined;
    return returnVal;
  };

  const push = source => {
    value = {
      ...value,
      ...source
    };
  };

  return { pop, push };
}
