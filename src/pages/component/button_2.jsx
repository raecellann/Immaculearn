import React, { useState } from 'react';

const Button = ({ text = "Share", onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const getIcon = () => {
    switch(text) {
      case "Add Member":
        return (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
        );
      case "Pending Invites":
        return (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case "Delete Room":
        return (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        );
      case "All Notifications":
        return (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        );
      case "Pending Join Requests":
        return (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        );
      case "Space Invitations":
        return (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M12 2l-5.5 9h11z M12 22l5.5-9h-11z M3.5 9l5.5 9 5.5-9z M20.5 9l-5.5 9-5.5-9z"/>
          </svg>
        );
      case "Go to Calendar":
        return (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.89-1.99 2L3 19c0 1.11.89 2 1.99 2H18c1.1 0 2-.9 2-2V8h-2v6zm-5-2c0-.55-.45-1-1-1s-.45 1-1 1-1 .45-1 1-1 .45 1 1 1zm4 8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M307 34.8c-11.5 5.1-19 16.6-19 29.2v64H176C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96h96v64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z" />
          </svg>
        );
    }
  };

  const getButtonColor = () => {
    switch(text) {
      case "Add Member":
        return "#22c55e"; // Green
      case "Pending Invites":
        return "#60a5fa"; // Light blue
      case "Archive":
        return "#3b82f6"; // Blue
      case "Delete Room":
        return "#ef4444"; // Red
      case "All Notifications":
        return "#1468B1"; // Gray
      case "Pending Join Requests":
        return "#60a5fa"; // Light blue
      case "Space Invitations":
        return "#22c55e"; // Green
      case "School Announcements":
        return "#fbbf24"; // Amber/Yellow
      default:
        return "#007AFF"; // Default blue
    }
  };

  const getHoverColor = () => {
    switch(text) {
      case "Add Member":
        return "#16a34a"; // Darker green
      case "Pending Invites":
        return "#3b82f6"; // Blue
      case "Archive":
        return "#2563eb"; // Darker blue
      case "Delete Room":
        return "#dc2626"; // Darker red
      case "All Notifications":
        return "#1c7acdff"; // Darker blue
      case "Pending Join Requests":
        return "#3b82f6"; // Blue
      case "Space Invitations":
        return "#16a34a"; // Darker green
      case "School Announcements":
        return "#f59e0b"; // Darker amber
      default:
        return "#0066D2"; // Default darker blue
    }
  };

  const getButtonStyle = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const borderColor = isDarkMode ? 'white' : '#1a1a1a';
    
    let computedStyle = {
      color: "#fff",
      cursor: "pointer",
      border: `1px solid ${borderColor}`,
      borderRadius: "6px",
      padding: "clamp(0.3em, 1vw, 0.4em) clamp(0.8em, 3vw, 1.2em)",
      background: getButtonColor(),
      transition: "all 0.2s ease-in-out",
      fontWeight: "500",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "clamp(0.2em, 1vw, 0.4em)",
      fontSize: "clamp(0.6rem, 2.5vw, 0.75rem)",
      minWidth: "fit-content",
      whiteSpace: "nowrap",
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
    };

    if (isHovered) {
      computedStyle.color = "#fff";
      computedStyle.background = getHoverColor();
      computedStyle.transform = "translate(-0.15rem, -0.15rem)";
      computedStyle.boxShadow = "0.15rem 0.15rem rgba(0, 0, 0, 0.3)";
    }

    if (isActive) {
      computedStyle.transform = "translate(0)";
      computedStyle.boxShadow = "none";
    }

    return computedStyle;
  };

  const iconStyle = {
    fill: "#fff",
    width: "1em",
    height: "1em",
    display: "inline-block",
    verticalAlign: "middle",
  };

  return (
    <button 
      style={getButtonStyle()}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      <span style={iconStyle}>
        {getIcon()}
      </span>
      {text}
    </button>
  );
};

export default Button;
