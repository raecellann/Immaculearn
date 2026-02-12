export const prefixName = (name, gender) => {
  const prefixes = {
    M: "Sir",
    F: "Madam"
  };


  return `${prefixes[gender] || ""} ${name}`.trim();
}

