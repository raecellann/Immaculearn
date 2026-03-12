import React, { useState } from "react";

const Button = ({
  children,
  onClick,
  disabled = false,
  className = "",
  style = {},
  type = "button",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseButtonStyle = {
    color: "#fff",
    cursor: "pointer",
    border: "1px solid #007AFF",
    borderRadius: "20px",
    padding: "0.6em 1.8em",
    background: "#007AFF",
    transition: "all 0.2s ease-in-out",
    fontWeight: "600",
    ...style,
  };

  const getButtonStyle = () => {
    let computedStyle = { ...baseButtonStyle };

    if (isHovered) {
      computedStyle.color = "#fff";
      // Keep the same background color, only add transform and shadow
      computedStyle.transform = "translate(-0.25rem, -0.25rem)";
      computedStyle.boxShadow = "0.25rem 0.25rem #000";
    }

    if (isActive) {
      computedStyle.transform = "translate(0)";
      computedStyle.boxShadow = "none";
    }

    return computedStyle;
  };

  return (
    <button
      type={type}
      className={className}
      style={getButtonStyle()}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {children}
    </button>
  );
};

export default Button;
