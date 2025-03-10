// components/GroupHistory.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import EditableGroupName from './EditableGroupName';
import Droppable from './Droppable';
import DraggableStudent from './DraggableStudent';
import { GroupingHistoryEntry, Student } from '../types';

interface GroupHistoryProps {
  currentClassId: string | null;
  className: string;
  refreshKey: number;
}

const GroupHistory: React.FC<GroupHistoryProps> = ({ currentClassId, className, refreshKey }) => {
  const supabase = createClient();

  const [groupHistory, setGroupHistory] = useState<GroupingHistoryEntry[]>([]);
  const [selectedGrouping, setSelectedGrouping] = useState<GroupingHistoryEntry | null>(null);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({});
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [groupingId, setGroupingId] = useState<string | null>(null);

  // Wrap fetchGroupingHistory in useCallback
  const fetchGroupingHistory = useCallback(async () => {
    if (!currentClassId) {
      setGroupHistory([]);
      return;
    }
    const { data, error } = await supabase
      .from('grouping_history')
      .select('*')
      .eq('class_id', currentClassId)
      .order('timestamp', { ascending: false });
    if (!error && data) {
      setGroupHistory(data as GroupingHistoryEntry[]);
    }
  }, [currentClassId, supabase]);

  useEffect(() => {
    fetchGroupingHistory();
  }, [fetchGroupingHistory, refreshKey]);

  // Load a specific grouping for editing.
  const loadGrouping = (grouping: GroupingHistoryEntry) => {
    setSelectedGrouping(grouping);
    // Deep copy groups to avoid mutation.
    const loadedGroups = grouping.groups.map(group => [...group.students]);
    setGroups(loadedGroups);
    const loadedGroupNames = grouping.groups.reduce((acc, group, index) => {
      acc[index] = group.name;
      return acc;
    }, {} as { [key: number]: string });
    setGroupNames(loadedGroupNames);
    setGroupingId(grouping.id);
    setDraggedStudentId(null);
  };

  const handleDragStart = (studentId: string) => {
    setDraggedStudentId(studentId);
  };

  const handleDragEnd = (studentId: string, destinationGroupId: string) => {
    if (draggedStudentId === null || !selectedGrouping) return;

    const destinationGroupIndex = parseInt(destinationGroupId.split('-')[1], 10);
    if (
      isNaN(destinationGroupIndex) ||
      destinationGroupIndex < 0 ||
      destinationGroupIndex >= groups.length
    ) {
      alert('Cannot drop the student here. Please choose a valid group.');
      return;
    }

    // Clone groups to avoid state mutation.
    const newGroups = groups.map(group => [...group]);
    let sourceGroupIndex = -1;
    let movedStudent: Student | null = null;
    for (let i = 0; i < newGroups.length; i++) {
      const index = newGroups[i].findIndex(s => s.id === draggedStudentId);
      if (index !== -1) {
        sourceGroupIndex = i;
        movedStudent = newGroups[i].splice(index, 1)[0];
        break;
      }
    }
    if (sourceGroupIndex === -1 || !movedStudent) {
      alert('Source group not found.');
      return;
    }
    if (sourceGroupIndex === destinationGroupIndex) {
      setDraggedStudentId(null);
      return;
    }
    newGroups[destinationGroupIndex].push(movedStudent);
    setGroups(newGroups);
    if (selectedGrouping) {
      const updatedGroups = newGroups.map((group, index) => ({
        ...selectedGrouping.groups[index],
        students: group,
      }));
      setSelectedGrouping({
        ...selectedGrouping,
        groups: updatedGroups,
      });
    }
    setDraggedStudentId(null);
  };

  // Update the grouping history record in Supabase.
  const saveGroupingHistory = useCallback(async () => {
    if (!currentClassId || !groupingId) {
      return;
    }
    const updatedGroups = groups.map((group, index) => ({
      id: String(index),
      name: groupNames[index],
      students: group,
    }));
    const updatedEntry = {
      timestamp: new Date().toISOString(),
      groups: updatedGroups,
      number_of_students: groups.reduce((acc, group) => acc + group.length, 0),
    };
    const { error } = await supabase
      .from('grouping_history')
      .update(updatedEntry)
      .eq('id', groupingId);
    if (!error) {
      fetchGroupingHistory();
    }
  }, [currentClassId, groupingId, groups, groupNames, supabase, fetchGroupingHistory]);

  // Wrap closeModal in useCallback so it can be used in useEffect
  const closeModal = useCallback(async () => {
    if (groupingId !== null) {
      await saveGroupingHistory();
    }
    setSelectedGrouping(null);
    setGroupingId(null);
    setDraggedStudentId(null);
  }, [groupingId, saveGroupingHistory]);

  // Delete a grouping history record from Supabase.
  const handleDeleteGrouping = async (groupingIdToDelete: string) => {
    if (!currentClassId) {
      return;
    }
    const { error } = await supabase
      .from('grouping_history')
      .delete()
      .eq('id', groupingIdToDelete)
      .eq('class_id', currentClassId);
    if (!error) {
      fetchGroupingHistory();
      if (selectedGrouping && selectedGrouping.id === groupingIdToDelete) {
        setSelectedGrouping(null);
        setGroups([]);
        setGroupNames({});
        setGroupingId(null);
        setDraggedStudentId(null);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    if (selectedGrouping) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedGrouping, closeModal]);

  const handleGroupNameChange = (groupIndex: number, newName: string) => {
    setGroupNames(prev => ({ ...prev, [groupIndex]: newName }));
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

  return (
    <div className="group-history">
      <h2>Previous Groupings</h2>
      {groupHistory.length === 0 ? (
        <p>No previous groupings available.</p>
      ) : (
        <ul>
          {groupHistory.map(grouping => (
            <li
              key={grouping.id}
              onClick={() => loadGrouping(grouping)}
              style={{
                cursor: 'pointer',
                marginBottom: '0.5rem',
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>{new Date(grouping.timestamp).toLocaleString()}</strong> -{' '}
                {grouping.method === 'byGroups'
                  ? `${grouping.value} Groups`
                  : `${grouping.value} Students per Group`}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteGrouping(grouping.id);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#e74c3c',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
                aria-label={`Delete grouping created on ${new Date(grouping.timestamp).toLocaleString()}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedGrouping && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Close Modal">
              &times;
            </button>
            <h2>Loaded Grouping</h2>
            <div className="groups-display">
              {groups.map((group, groupIndex) => (
                <Droppable
                  key={groupIndex}
                  id={`group-${groupIndex}`}
                  onDrop={(studentId) => handleDragEnd(String(studentId), `group-${groupIndex}`)}
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
};

export default GroupHistory;