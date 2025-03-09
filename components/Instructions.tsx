// components/Instructions.tsx
"use client";

import React from 'react';

interface InstructionsProps {
  isPopover?: boolean;
  onClose?: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ isPopover = false, onClose }) => {
  return (
    <div className={`instructions ${isPopover ? 'instructions-popover' : ''}`}>
      {isPopover && (
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close instructions"
        >
          &times;
        </button>
      )}
      <h2>Welcome to Random Roster!</h2>
      <p>
        Random Roster helps you manage your classes and generate randomized rosters for group assignments effortlessly. Here’s how to get started:
      </p>
      <ol>
        <li>
          <strong>Add a Class:</strong> Enter the name of your class and click the “+” button to create a new class.
        </li>
        <li>
          <strong>Add Students:</strong> Select your class, enter student names, and add them to the class.
        </li>
        <li>
          <strong>Generate Roster:</strong> Use the “Generate Groups” feature to create randomized, balanced rosters.
        </li>
        <li>
          <strong>View Previous Rosters:</strong> Access saved rosters from the “Previous Groupings” list to review or reuse them.
        </li>
        <li>
          <strong>Edit Rosters:</strong> Rearrange students between groups using the drag-and-drop functionality and rename groups as needed.
        </li>
      </ol>
      <p>
        Start by adding your first class to unlock all features!
      </p>
    </div>
  );
};

export default Instructions;