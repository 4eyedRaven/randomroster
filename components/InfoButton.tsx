// components/InfoButton.tsx
"use client";

import React, { useState } from 'react';
import Instructions from './Instructions';

interface InfoButtonProps {
  visible: boolean;
}

const InfoButton: React.FC<InfoButtonProps> = ({ visible }) => {
  const [showPopover, setShowPopover] = useState(false);

  if (!visible) return null;
  
  // Handle clicks on overlay to close the popover
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close the popover when the overlay is clicked
    setShowPopover(false);
  };

  // Prevent clicks inside the popover from closing it
  const handlePopoverClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop the click event from propagating to the overlay
    e.stopPropagation();
  };

  return (
    <>
      <button 
        className="info-button" 
        onClick={() => setShowPopover(true)}
        aria-label="Show instructions"
      >
        i
      </button>
      
      {showPopover && (
        <div className="popover-overlay" onClick={handleOverlayClick}>
          <div className="popover-container" onClick={handlePopoverClick}>
            <Instructions 
              isPopover={true} 
              onClose={() => setShowPopover(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default InfoButton;
