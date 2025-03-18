"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Droppable from "./Droppable";
import DraggableStudent from "./DraggableStudent";
import EditableGroupName from "./EditableGroupName";
import GroupHistoryRow from "./GroupHistoryRow";
import { GroupingHistoryEntry, Student } from "../types";

export default function GroupHistory({
  currentClassId,
  className,
  refreshKey,
}: {
  currentClassId: string | null;
  className: string;
  refreshKey: number;
}) {
  const supabase = createClient();
  const [groupHistory, setGroupHistory] = useState<GroupingHistoryEntry[]>([]);
  const [selectedGrouping, setSelectedGrouping] = useState<GroupingHistoryEntry | null>(null);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({});
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [groupingId, setGroupingId] = useState<string | null>(null);

  // Helper: Build fallback label from a grouping entry.
  const buildFallbackLabel = (g: GroupingHistoryEntry) => {
    const dateString = new Date(g.timestamp).toLocaleString();
    const methodString =
      g.method === "byGroups"
        ? `${g.value} Groups`
        : `${g.value} Students per Group`;
    return `${dateString} - ${methodString}`;
  };

  // Fetch grouping history from Supabase
  const fetchGroupingHistory = useCallback(async () => {
    if (!currentClassId) {
      setGroupHistory([]);
      return;
    }
    const { data, error } = await supabase
      .from("grouping_history")
      .select("*")
      .eq("class_id", currentClassId)
      .order("timestamp", { ascending: false });

    if (!error && data) {
      setGroupHistory(data as GroupingHistoryEntry[]);
    }
  }, [currentClassId, supabase]);

  useEffect(() => {
    fetchGroupingHistory();
  }, [fetchGroupingHistory, refreshKey]);

  // Opens the grouping in a modal
  const loadGrouping = (grouping: GroupingHistoryEntry) => {
    setSelectedGrouping(grouping);
    setGroupingId(grouping.id);

    // Copy groups for drag-and-drop
    const loadedGroups = grouping.groups.map((g) => [...g.students]);
    setGroups(loadedGroups);

    // Map groupIndex => groupName
    const loadedGroupNames = grouping.groups.reduce((acc, grp, idx) => {
      acc[idx] = grp.name;
      return acc;
    }, {} as { [key: number]: string });
    setGroupNames(loadedGroupNames);

    setDraggedStudentId(null);
  };

  // Saves re-ordered groups
  const saveGroupingHistory = useCallback(async () => {
    if (!currentClassId || !groupingId) return;

    const updatedGroups = groups.map((group, index) => ({
      id: String(index),
      name: groupNames[index],
      students: group,
    }));

    const updatedEntry = {
      timestamp: new Date().toISOString(),
      groups: updatedGroups,
      number_of_students: groups.reduce((acc, g) => acc + g.length, 0),
      // Do not overwrite description here.
    };

    const { error } = await supabase
      .from("grouping_history")
      .update(updatedEntry)
      .eq("id", groupingId);

    if (!error) {
      fetchGroupingHistory();
    }
  }, [currentClassId, groupingId, groups, groupNames, supabase, fetchGroupingHistory]);

  // Closes the modal
  const closeModal = async () => {
    if (groupingId) {
      await saveGroupingHistory();
    }
    setSelectedGrouping(null);
    setGroupingId(null);
    setDraggedStudentId(null);
  };

  // Delete a grouping
  const handleDeleteGrouping = async (idToDelete: string) => {
    if (!currentClassId) return;
    const { error } = await supabase
      .from("grouping_history")
      .delete()
      .eq("id", idToDelete)
      .eq("class_id", currentClassId);

    if (!error) {
      setGroupHistory((prev) => prev.filter((g) => g.id !== idToDelete));
      if (selectedGrouping && selectedGrouping.id === idToDelete) {
        setSelectedGrouping(null);
        setGroups([]);
        setGroupNames({});
        setGroupingId(null);
        setDraggedStudentId(null);
      }
    }
  };

  // Edit the grouping's description
  const handleUpdateDescription = async (groupingId: string, newDescription: string) => {
    if (!currentClassId) return;

    const { error } = await supabase
      .from("grouping_history")
      .update({ description: newDescription })
      .eq("id", groupingId)
      .eq("class_id", currentClassId);

    if (error) {
      alert("Error updating description: " + error.message);
      return;
    }
    // Update local state
    setGroupHistory((prev) =>
      prev.map((g) => (g.id === groupingId ? { ...g, description: newDescription } : g))
    );
    if (selectedGrouping && selectedGrouping.id === groupingId) {
      setSelectedGrouping({ ...selectedGrouping, description: newDescription });
    }
  };

  // Drag-and-drop handling
  const handleDragStart = (studentId: string) => {
    setDraggedStudentId(studentId);
  };

  const handleDragEnd = (studentId: string, destinationGroupId: string) => {
    if (!selectedGrouping || draggedStudentId === null) return;

    const destinationIndex = parseInt(destinationGroupId.split("-")[1], 10);
    if (
      isNaN(destinationIndex) ||
      destinationIndex < 0 ||
      destinationIndex >= groups.length
    ) {
      alert("Cannot drop the student here. Invalid group index.");
      return;
    }

    const newGroups = groups.map((group) => [...group]);
    let sourceIndex = -1;
    let movedStudent: Student | null = null;

    for (let i = 0; i < newGroups.length; i++) {
      const idx = newGroups[i].findIndex((s) => s.id === draggedStudentId);
      if (idx !== -1) {
        sourceIndex = i;
        movedStudent = newGroups[i].splice(idx, 1)[0];
        break;
      }
    }
    if (sourceIndex === -1 || !movedStudent) {
      alert("Could not find the dragged student in any group.");
      return;
    }
    if (sourceIndex === destinationIndex) {
      setDraggedStudentId(null);
      return;
    }

    newGroups[destinationIndex].push(movedStudent);
    setGroups(newGroups);

    const updatedGroups = newGroups.map((group, index) => ({
      ...selectedGrouping.groups[index],
      students: group,
    }));
    setSelectedGrouping({ ...selectedGrouping, groups: updatedGroups });

    setDraggedStudentId(null);
  };

  // Rename a group
  const handleGroupNameChange = (groupIndex: number, newName: string) => {
    setGroupNames((prev) => ({ ...prev, [groupIndex]: newName }));
    if (selectedGrouping) {
      const updatedGroups = selectedGrouping.groups.map((grp, idx) => {
        if (idx === groupIndex) {
          return { ...grp, name: newName };
        }
        return grp;
      });
      setSelectedGrouping({ ...selectedGrouping, groups: updatedGroups });
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (selectedGrouping) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedGrouping]);

  return (
    <div className="group-history">
      <h2>Previous Groupings</h2>
      {groupHistory.length === 0 ? (
        <p>No previous groupings available.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groupHistory.map((grouping) => (
            <GroupHistoryRow
              key={grouping.id}
              grouping={grouping}
              onLoadGrouping={loadGrouping}
              onUpdateDescription={handleUpdateDescription}
              onDeleteGrouping={handleDeleteGrouping}
            />
          ))}
        </ul>
      )}

      {/* Modal for the selected grouping */}
      {selectedGrouping && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              &times;
            </button>
            <h2>
              {selectedGrouping.description?.trim()
                ? selectedGrouping.description
                : buildFallbackLabel(selectedGrouping)}
            </h2>
            <div className="groups-display">
              {groups.map((group, groupIndex) => (
                <Droppable
                  key={groupIndex}
                  id={`group-${groupIndex}`}
                  onDrop={(studentId) =>
                    handleDragEnd(String(studentId), `group-${groupIndex}`)
                  }
                >
                  <div className="group-card">
                    <EditableGroupName
                      groupIndex={groupIndex}
                      groupName={groupNames[groupIndex]}
                      onGroupNameChange={handleGroupNameChange}
                    />
                    <ul>
                      {group.map((student) => (
                        <DraggableStudent
                          key={student.id}
                          student={student}
                          onDragStart={() => handleDragStart(student.id)}
                          isDragging={draggedStudentId === student.id}
                        />
                      ))}
                    </ul>
                  </div>
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}