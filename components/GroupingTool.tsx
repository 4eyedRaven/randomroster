// components/GroupingTool.tsx
"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Student } from '../types';
import Droppable from './Droppable';
import DraggableStudent from './DraggableStudent';
import EditableGroupName from './EditableGroupName';
import ShufflingAnimation from './ShufflingAnimation';
import { createClient } from '@/utils/supabase/client';

interface GroupingToolProps {
  students: Student[];
  currentClassId: string | null;
  onGroupingSaved: () => void;
}

export default function GroupingTool({
  students,
  currentClassId,
  onGroupingSaved,
}: GroupingToolProps) {
  const supabase = createClient();

  // Top-level mode: either distributed by capability or completely random.
  const [groupingMode, setGroupingMode] = useState<'distributed' | 'random'>('distributed');
  // Only used when distributed mode is selected.
  const [distributedMethod, setDistributedMethod] = useState<'byGroups' | 'byStudents'>('byGroups');
  
  // These values are used to configure the number of groups or students per group.
  const [groupCountInput, setGroupCountInput] = useState<string>('');
  const [groupCount, setGroupCount] = useState<number>(2);
  const [studentsPerGroup, setStudentsPerGroup] = useState<number>(4);

  // Grouping state
  const [groups, setGroups] = useState<Student[][]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [groupingId, setGroupingId] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string>('');
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'shuffling' | 'completed'>('idle');

  const generateGroups = () => {
    if (students.length === 0) {
      alert('No students available to group.');
      return;
    }
    
    // Determine how many groups to create.
    let numGroups: number;
    if (groupingMode === 'distributed') {
      if (distributedMethod === 'byGroups') {
        if (!Number.isInteger(groupCount) || groupCount < 1) {
          setInputError('Please enter a valid number of groups (at least 1).');
          return;
        }
        if (groupCount > students.length) {
          setInputError('Number of groups cannot exceed the number of students.');
          return;
        }
        numGroups = groupCount;
      } else {
        // byStudents method
        if (!Number.isInteger(studentsPerGroup) || studentsPerGroup < 1) {
          setInputError('Please enter a valid number of students per group (at least 1).');
          return;
        }
        if (studentsPerGroup > students.length) {
          setInputError('Students per group cannot exceed the number of students.');
          return;
        }
        numGroups = Math.ceil(students.length / studentsPerGroup);
      }
    } else {
      // For completely random mode, we’ll use groupCount.
      if (!Number.isInteger(groupCount) || groupCount < 1) {
        setInputError('Please enter a valid number of groups (at least 1).');
        return;
      }
      if (groupCount > students.length) {
        setInputError('Number of groups cannot exceed the number of students.');
        return;
      }
      numGroups = groupCount;
    }
    
    // Prepare the combined list of students.
    let combinedStudents: Student[];
    if (groupingMode === 'random') {
      // Completely random: Shuffle the entire list.
      combinedStudents = [...students];
      combinedStudents.sort(() => Math.random() - 0.5);
    } else {
      // Distributed by capability.
      const highStudents = students.filter((s) => s.capability_level === 'high');
      const mediumStudents = students.filter((s) => s.capability_level === 'medium');
      const lowStudents = students.filter((s) => s.capability_level === 'low');
      
      const shuffle = (array: Student[]) => array.sort(() => Math.random() - 0.5);
      shuffle(highStudents);
      shuffle(mediumStudents);
      shuffle(lowStudents);
      
      combinedStudents = [];
      const maxLength = Math.max(highStudents.length, mediumStudents.length, lowStudents.length);
      for (let i = 0; i < maxLength; i++) {
        if (highStudents[i]) combinedStudents.push(highStudents[i]);
        if (mediumStudents[i]) combinedStudents.push(mediumStudents[i]);
        if (lowStudents[i]) combinedStudents.push(lowStudents[i]);
      }
    }
    
    // Distribute the combined students into groups round-robin.
    const newGroups: Student[][] = Array.from({ length: numGroups }, () => []);
    combinedStudents.forEach((student, index) => {
      const groupIndex = index % numGroups;
      newGroups[groupIndex].push(student);
    });
    
    // Set default group names.
    const initialGroupNames: { [key: number]: string } = {};
    newGroups.forEach((_, index) => {
      initialGroupNames[index] = `Group ${index + 1}`;
    });
    
    const newGroupingId = uuidv4();
    setGroupingId(newGroupingId);
    setGroups(newGroups);
    setGroupNames(initialGroupNames);
    setAnimationPhase('shuffling');
    setShowModal(true);
    setInputError('');
  };

  // Save grouping history into Supabase (remains unchanged).
  const saveGroupingHistory = async () => {
    if (currentClassId === null || groupingId === null) return;
    const updatedGroups = groups.map((group, index) => ({
      id: String(index),
      name: groupNames[index],
      students: group,
    }));
    const newEntry = {
      id: groupingId,
      class_id: currentClassId,
      timestamp: new Date().toISOString(),
      method: groupingMode === 'random' ? 'random' : distributedMethod,
      value: groupingMode === 'random' ? groupCount : (distributedMethod === 'byGroups' ? groupCount : studentsPerGroup),
      number_of_students: students.length,
      groups: updatedGroups,
    };

    const { error } = await supabase
      .from('grouping_history')
      .upsert(newEntry, { onConflict: 'id' });
    if (!error) {
      // Refresh grouping history if needed.
    }
  };

  const closeModal = async () => {
    if (groupingId !== null) {
      await saveGroupingHistory();
      onGroupingSaved();
    }
    setShowModal(false);
    setGroupingId(null);
    setDraggedStudentId(null);
    setAnimationPhase('idle');
  };

  // Handle escape key to close modal.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setAnimationPhase('idle');
      }
    };

    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const handleDragStart = (studentId: string) => {
    setDraggedStudentId(studentId);
  };

  const handleDragEnd = (studentId: string, destinationGroupId: string) => {
    if (draggedStudentId === null) return;
    const sourceGroupIndex = groups.findIndex((group) =>
      group.some((s) => s.id === draggedStudentId)
    );
    const destinationGroupIndex = parseInt(destinationGroupId.split('-')[1], 10);

    if (
      sourceGroupIndex === -1 ||
      destinationGroupIndex === -1 ||
      sourceGroupIndex === destinationGroupIndex
    ) {
      setDraggedStudentId(null);
      return;
    }

    const newGroups = groups.map((group) => [...group]);
    const sourceGroup = newGroups[sourceGroupIndex];
    const studentIndex = sourceGroup.findIndex((s) => s.id === draggedStudentId);
    if (studentIndex === -1) {
      setDraggedStudentId(null);
      return;
    }
    const [movedStudent] = sourceGroup.splice(studentIndex, 1);
    newGroups[destinationGroupIndex].push(movedStudent);
    setGroups(newGroups);
    setDraggedStudentId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setGroupCountInput(value);
      const num = value === '' ? 0 : parseInt(value, 10);
      if (groupingMode === 'distributed' && distributedMethod === 'byGroups') {
        setGroupCount(num);
      } else if (groupingMode === 'distributed' && distributedMethod === 'byStudents') {
        setStudentsPerGroup(num);
      } else if (groupingMode === 'random') {
        setGroupCount(num);
      }
      setInputError('');
    } else {
      setInputError('Please enter a valid number.');
    }
  };

  const handleGroupNameChange = (groupIndex: number, newName: string) => {
    setGroupNames((prevNames) => ({
      ...prevNames,
      [groupIndex]: newName,
    }));
  };

  return (
    <div className="grouping-tool">
      <h2>Grouping Tool</h2>
      
      {/* Top-level Mode Selection */}
      <div className="grouping-options">
        <label>
          <input
            type="radio"
            value="distributed"
            checked={groupingMode === 'distributed'}
            onChange={() => {
              setGroupingMode('distributed');
              // Reset to default distributed sub-mode.
              setDistributedMethod('byGroups');
              setGroupCountInput('');
              setGroupCount(2);
              setInputError('');
            }}
          />
          Distributed by Capability
        </label>
        <label>
          <input
            type="radio"
            value="random"
            checked={groupingMode === 'random'}
            onChange={() => {
              setGroupingMode('random');
              setGroupCountInput('');
              setGroupCount(2);
              setInputError('');
            }}
          />
          Completely Random
        </label>
      </div>
      
      {/* Sub-options for distributed mode */}
      {groupingMode === 'distributed' && (
        <div className="distributed-options">
          <label>
            <input
              type="radio"
              value="byGroups"
              checked={distributedMethod === 'byGroups'}
              onChange={() => {
                setDistributedMethod('byGroups');
                setGroupCountInput('');
                setGroupCount(2);
                setInputError('');
              }}
            />
            By Number of Groups
          </label>
          <label>
            <input
              type="radio"
              value="byStudents"
              checked={distributedMethod === 'byStudents'}
              onChange={() => {
                setDistributedMethod('byStudents');
                setGroupCountInput('');
                setStudentsPerGroup(4);
                setInputError('');
              }}
            />
            By Students per Group
          </label>
        </div>
      )}
      
      {/* Input for number of groups or students per group */}
      <div className="group-count">
        <input
          type="text"
          value={groupCountInput}
          onChange={handleInputChange}
          placeholder={
            groupingMode === 'distributed'
              ? distributedMethod === 'byGroups'
                ? 'Number of Groups'
                : 'Number of Students per Group'
              : 'Number of Groups'
          }
          aria-label={
            groupingMode === 'distributed'
              ? distributedMethod === 'byGroups'
                ? 'Number of Groups'
                : 'Number of Students per Group'
              : 'Number of Groups'
          }
          className={inputError ? 'input-error' : ''}
        />
        <button onClick={generateGroups} aria-label="Generate Groups">
          Generate Groups
        </button>
      </div>
      {inputError && <p className="error-message">{inputError}</p>}
      
      {/* Modal for group display */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Close Modal">
              &times;
            </button>
            <h2>
              {animationPhase === 'completed'
                ? 'Generated Groups'
                : 'Generating Groups...'}
            </h2>
            <div className="groups-display">
              {animationPhase === 'completed' ? (
                groups.map((group, groupIndex) => (
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
                ))
              ) : (
                <ShufflingAnimation
                  students={students}
                  onAnimationComplete={() => setAnimationPhase('completed')}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}