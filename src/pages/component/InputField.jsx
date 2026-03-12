import React from "react";

const InputField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  className = "",
  style = {},
  ...props
}) => {
  const baseStyle = {
    maxWidth: "100%",
    padding: "0.875rem",
    fontSize: "1rem",
    border: "1.5px solid #000",
    borderRadius: "0.5rem",
    boxShadow: "2.5px 3px 0 #000",
    outline: "none",
    transition: "box-shadow ease 0.25s",
    backgroundColor: "white",
    color: "#000000", // Ensure text is visible
    ...style, // ✅ merge user-defined styles
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      className={className}
      style={baseStyle}
      onFocus={(e) => (e.target.style.boxShadow = "5.5px 7px 0 black")}
      onBlur={(e) => (e.target.style.boxShadow = "2.5px 3px 0 #000")}
      {...props}
    />
  );
};

export default InputField;
