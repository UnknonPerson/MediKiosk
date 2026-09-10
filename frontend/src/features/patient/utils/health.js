export const formatDate = (value, options = { day: "numeric", month: "short", year: "numeric" }) => value ? new Intl.DateTimeFormat("en-IN", options).format(new Date(value)) : "Not available";
export const titleCase = (value = "") => value.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, letter) => ` ${letter.toUpperCase()}`).trim();
