import React, { useState} from 'react';


const HoverButton = ({ onClick, label, styleOverrides = {} }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const buttonStyle = {
      backgroundColor: isHovered ? "#003366" : "#00468b",
      color: isHovered ? "#f0f0f0" : "white",
      padding: "0.5rem 1rem",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
      boxShadow: isHovered ? "0px 4px 6px rgba(0, 0, 0, 0.2)" : "none",
      transform: isHovered ? "scale(1.05)" : "scale(1)",
      transition: "all 0.3s ease",
      width: "100%", 
      boxSizing: "border-box",
      ...styleOverrides,
    };
    
    return (
      <button 
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      >
        {label}
        </button>
    );
  };
  export default HoverButton;