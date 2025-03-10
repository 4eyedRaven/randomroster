import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const CapabilityInfoPopover: React.FC = () => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPopover(true)}
        className="capability-info-button"
        aria-label="Show capability information"
      >
        <HelpCircle size={20} />
      </button>

      {showPopover && (
        <div className="popover-overlay" onClick={() => setShowPopover(false)}>
          <div className="popover-container" onClick={(e) => e.stopPropagation()}>
            <p>
              Capability level helps create balanced groups. “High” means advanced and “Low” means the student may need extra help.
            </p>
            <button onClick={() => setShowPopover(false)} aria-label="Close">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CapabilityInfoPopover;