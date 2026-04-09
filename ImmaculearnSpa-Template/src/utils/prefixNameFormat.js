export const prefixName = (name, gender) => {
  const prefixes = {
    M: "Sir",
    F: "Ma'am"
  };


  return `${prefixes[gender] || ""} ${name}`.trim();
}

