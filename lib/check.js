exports.valueRequired = (value) => {
  const type = typeof value;

  if (type === "boolean") return true;

  if (
    value === null ||
    value === "" ||
    value === "null" ||
    value === "undefined" ||
    value === undefined ||
    !value
  ) {
    return false;
  } else {
    return true;
  }
};
