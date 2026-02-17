import React from 'react';

const Button = ({ text = "Share" }) => {
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
      default:
        return "rgba(50, 100, 180, 0.5)"; // Default blue
    }
  };

  const getTextColor = () => {
    switch(text) {
      case "Add Member":
        return "#22c55e"; // Green
      case "Pending Invites":
        return "#3b82f6"; // Blue
      case "Delete Room":
        return "#ef4444"; // Red
      default:
        return "white"; // Default white
    }
  };

  const getBorderColor = () => {
    switch(text) {
      case "Add Member":
        return "#22c55e"; // Green
      case "Pending Invites":
        return "#3b82f6"; // Blue
      case "Delete Room":
        return "#ef4444"; // Red
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
      onMouseEnter={(e) => {
        const color = getHoverColor();
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, #212121 70%)`;
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 0 1em 0.45em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0 0.5em';

        // 👇 Make text white
        e.target.style.color = 'white';

        // 👇 Make icon white
        const svg = e.target.querySelector('svg');
        if (svg) svg.style.fill = 'white';
      }}

      onMouseLeave={(e) => {
        e.target.style.background = '#212121';
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 0 1em 1em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0';

        // 👇 Restore original color
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
