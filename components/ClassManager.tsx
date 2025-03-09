// components/ClassManager.tsx
"use client";

import { useState } from "react";
import { Class } from "../types";
import EditableClassName from "./EditableClassName";

interface ClassManagerProps {
  classes: Class[];
  currentClassId: string | null;
  onAddClass: (className: string) => void;
  onRemoveClass: (classId: string) => void;
  onSelectClass: (selectedClassId: string) => void;
  onRenameClass: (classId: string, newName: string) => void;
}

export default function ClassManager({
  classes,
  currentClassId,
  onAddClass,
  onRemoveClass,
  onSelectClass,
  onRenameClass,
}: ClassManagerProps) {
  const [newClassName, setNewClassName] = useState('');
  const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<string | null>(null);

  const handleAddClass = () => {
    if (newClassName.trim()) {
      onAddClass(newClassName.trim());
      setNewClassName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClass();
    }
  };

  return (
    <div className="class-manager">
      <h2>Classes</h2>
      <div className="class-list">
        {classes.map((c) => (
          <div
            key={c.id}
            className={`class-item ${currentClassId === c.id ? 'active' : ''}`}
            onClick={() => onSelectClass(c.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') onSelectClass(c.id);
            }}
            aria-pressed={currentClassId === c.id}
          >
            <EditableClassName
              classId={c.id}
              name={c.name}
              onRename={onRenameClass}
            />
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteClassId(c.id);
              }}
              aria-label={`Remove class ${c.name}`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="add-class">
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New class name"
          aria-label="New class name"
        />
        <button onClick={handleAddClass} aria-label="Add Class">
          +
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteClassId !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteClassId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the class &apos;
              {classes.find((c) => c.id === confirmDeleteClassId)?.name}
              &apos;? This action cannot be undone.
            </p>

            <div className="modal-buttons">
              <button
                className="delete-btn"
                onClick={() => {
                  onRemoveClass(confirmDeleteClassId);
                  setConfirmDeleteClassId(null);
                }}
              >
                Delete
              </button>
              <button onClick={() => setConfirmDeleteClassId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}