// components/GroupCard.tsx
"use client";

import { useState } from 'react';
import { Student } from '../types';

interface Group {
  id: number;
  students: Student[];
}

interface GroupCardProps {
  group: Group;
  groupName: string;
  onRenameGroup: (groupId: number, newName: string) => void;
}

export default function GroupCard({ group, groupName, onRenameGroup }: GroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(groupName);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== groupName) {
      onRenameGroup(group.id, trimmedName);
    } else {
      setTempName(groupName); // Revert to original name if empty or unchanged
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="group-card">
      {isEditing ? (
        <input
          type="text"
          value={tempName}
          onChange={handleNameChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="group-name-input"
          aria-label={`Rename ${groupName}`}
        />
      ) : (
        <h3 onClick={handleNameClick} className="group-name">
          {groupName}
        </h3>
      )}
      <ul>
        {group.students.map((student) => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
}