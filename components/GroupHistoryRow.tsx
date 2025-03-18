"use client";

import React, { useState } from "react";
import { GroupingHistoryEntry } from "../types";

interface GroupHistoryRowProps {
  grouping: GroupingHistoryEntry;
  onLoadGrouping: (g: GroupingHistoryEntry) => void;
  onUpdateDescription: (groupingId: string, newDescription: string) => void;
  onDeleteGrouping: (groupingId: string) => void;
}

export default function GroupHistoryRow({
  grouping,
  onLoadGrouping,
  onUpdateDescription,
  onDeleteGrouping,
}: GroupHistoryRowProps) {
  // If no description, show fallback: "timestamp - method"
  const fallbackLabel = buildFallbackLabel(grouping);

  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(grouping.description || fallbackLabel);

  /** If the user never entered a description, we build a fallback label. */
  function buildFallbackLabel(g: GroupingHistoryEntry) {
    const dateString = new Date(g.timestamp).toLocaleString();
    const methodString =
      g.method === "byGroups"
        ? `${g.value} Groups`
        : `${g.value} Students per Group`;
    return `${dateString} - ${methodString}`;
  }

  /** Called after user finishes editing (blur or pressing Enter). */
  const handleBlur = () => {
    setIsEditing(false);
    onUpdateDescription(grouping.id, tempText);
  };

  /** Allow Enter/Escape in the input. */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      // Revert to old or fallback
      setTempText(grouping.description || fallbackLabel);
      setIsEditing(false);
    }
  };

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        border: "1px solid var(--border-color)",
        borderRadius: "4px",
        marginBottom: "0.5rem",
        padding: "0.5rem",
      }}
    >
      {/* Description label (click to open grouping in modal) */}
      <span
        style={{
          flexGrow: 1,
          cursor: "pointer",
          color: "var(--text-color)",
        }}
        onClick={() => onLoadGrouping(grouping)}
      >
        {isEditing ? (
          // If editing, show an input
          <input
            type="text"
            value={tempText}
            autoFocus
            onChange={(e) => setTempText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "0.25rem",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
            }}
          />
        ) : (
          // Otherwise, show the text
          <strong>
            {grouping.description?.trim() ? grouping.description : fallbackLabel}
          </strong>
        )}
      </span>

      {/* Edit button toggles input. If already editing, we do "Save" on click. */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // do not open grouping
          if (!isEditing) {
            setIsEditing(true);
          } else {
            handleBlur();
          }
        }}
        style={{
          backgroundColor: "var(--border-color)",
          color: "var(--text-color)",
        }}
      >
        {isEditing ? "Save" : "Edit Description"}
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // do not open grouping
          onDeleteGrouping(grouping.id);
        }}
        style={{
          backgroundColor: "transparent",
          color: "#e74c3c",
          fontSize: "1.2rem",
        }}
      >
        &times;
      </button>
    </li>
  );
}