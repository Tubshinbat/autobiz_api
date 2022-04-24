exports.valueRequired = (value) => {
  const type = typeof value;

  if (type === "boolean") return true;

  if (type === "string") {
    if (
      value === null ||
      value === "" ||
      value.trim() === "" ||
      value === "null" ||
      value === "undefined"
    ) {
      return false;
    } else {
      return true;
    }
  }

  if (type === "object") {
    if (value.length > 1) return true;
    else return false;
  }
};
