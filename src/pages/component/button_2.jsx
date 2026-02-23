import React from 'react';

const Button = ({ text = "Share", onClick }) => {
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

  const getHoverColor = () => {
    switch(text) {
      case "Add Member":
        return "rgba(34, 197, 94, 0.5)"; // Green
      case "Pending Invites":
        return "rgba(59, 130, 246, 0.5)"; // Blue
      case "Delete Room":
        return "rgba(239, 68, 68, 0.5)"; // Red
      case "All Notifications":
        return "rgba(156, 163, 175, 0.5)"; // Gray
      case "Pending Join Requests":
        return "rgba(59, 130, 246, 0.5)"; // Blue
      case "Space Invitations":
        return "rgba(34, 197, 94, 0.5)"; // Green
      case "School Announcements":
        return "rgba(251, 191, 36, 0.5)"; // Amber/Yellow
      default:
        return "rgba(50, 100, 180, 0.5)"; // Default blue
    }
  };

  const getTextColor = () => {
    // Return black for light mode, white for dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    return isDarkMode ? "white" : "black";
  };

  const getHoverTextColor = () => {
    switch(text) {
      case "Add Member":
        return "#22c55e"; // Green
      case "Pending Invites":
        return "#3b82f6"; // Blue
      case "Delete Room":
        return "#ef4444"; // Red
      case "All Notifications":
        return "#9ca3af"; // Gray
      case "Pending Join Requests":
        return "#3b82f6"; // Blue
      case "Space Invitations":
        return "#22c55e"; // Green
      case "Go to Calendar":
        return "black"; // Black
      default:
        return "white"; // Default white
    }
  };

  const getBorderColor = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    switch(text) {
      case "Add Member":
        return "#22c55e"; // Green
      case "Pending Invites":
        return "#3b82f6"; // Blue
      case "Delete Room":
        return "#ef4444"; // Red
      case "All Notifications":
        return "#9ca3af"; // Gray
      case "Pending Join Requests":
        return "#3b82f6"; // Blue
      case "Space Invitations":
        return "#22c55e"; // Green
      case "School Announcements":
        return "#fbbf24"; // Amber/Yellow
      case "Go to Calendar":
        return isDarkMode ? "white" : "black"; // White border in dark mode, black in light
      default:
        return "transparent"; // Default transparent
    }
  };

  const buttonStyle = {
    cursor: 'pointer',
    padding: '0.5em 1em',
    fontSize: '0.7em',
    width: 'auto',
    height: 'auto',
    color: getTextColor(),
    background: 'transparent',
    borderRadius: '0.25em',
    border: 'none',
    boxShadow: 'none',
    transition: 'all 0.3s ease-in-out',
    outline: '0.1em solid #353535', 
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
  };

  const iconStyle = {
    fill: getTextColor(),
    width: '1em',
    height: '1em',
    marginRight: '0.5em',
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  return (
    <button 
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        const color = getHoverColor();
        const hoverTextColor = getHoverTextColor();
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, #212121 70%)`;
        // Remove scale transform and margin changes
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 0 1em 0.45em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0';

        // 👇 Change text to category color on hover
        e.target.style.color = hoverTextColor;

        // 👇 Change icon to category color on hover
        const svg = e.target.querySelector('svg');
        if (svg) svg.style.fill = hoverTextColor;
      }}

      onMouseLeave={(e) => {
        e.target.style.background = '#212121';
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 0 1em 1em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0';

        // Restore original color
        e.target.style.color = getTextColor();

        const svg = e.target.querySelector('svg');
        if (svg) svg.style.fill = getTextColor();
      }}
    >
      <span style={iconStyle}>
        {getIcon()}
      </span>
      {text}
    </button>
  );
};

export default Button;
