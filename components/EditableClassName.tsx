// components/EditableClassName.tsx
"use client";

import { useState } from "react";

interface EditableClassNameProps {
  classId: string;
  name: string;
  onRename: (classId: string, newName: string) => void;
}

const EditableClassName: React.FC<EditableClassNameProps> = ({ classId, name, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== name) {
      onRename(classId, trimmedName);
    } else {
      setTempName(name); // revert if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setTempName(name);
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
      className="editable-class-name-input"
      aria-label="Edit class name"
    />
  ) : (
    <span
      onClick={handleNameClick}
      className="editable-class-name"
      title="Click to edit"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') handleNameClick();
      }}
    >
      {name}
    </span>
  );
};

export default EditableClassName;