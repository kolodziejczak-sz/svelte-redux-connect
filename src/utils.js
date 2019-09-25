export const isFunction = obj =>
  !!(obj && obj.constructor && obj.call && obj.apply);

export const isObject = value => {
  const type = typeof value;
  return value != null && (type == "object" || type == "function");
};
