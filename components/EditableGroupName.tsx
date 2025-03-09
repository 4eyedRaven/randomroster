// components/EditableGroupName.tsx
"use client";

import { useState } from 'react';

interface EditableGroupNameProps {
  groupIndex: number;
  groupName: string;
  onGroupNameChange: (groupIndex: number, newName: string) => void;
}

const EditableGroupName: React.FC<EditableGroupNameProps> = ({ groupIndex, groupName, onGroupNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(groupName);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (tempName.trim() === '') {
      setTempName(groupName); // Revert to original name if empty
    } else {
      onGroupNameChange(groupIndex, tempName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setTempName(groupName); // Revert to original name
      setIsEditing(false);
    }
  };

  return isEditing ? (
    <input
      type="text"
      value={tempName}
      onChange={(e) => setTempName(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      className="group-name-input"
      aria-label={`Edit name for Group ${groupIndex + 1}`}
    />
  ) : (
    <h3
      className="group-name"
      onClick={handleNameClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') handleNameClick();
      }}
      aria-label={`Group name: ${groupName}`}
    >
      {groupName}
    </h3>
  );
};

export default EditableGroupName;