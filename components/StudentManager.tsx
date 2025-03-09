// components/StudentManager.tsx
"use client";

import { useState } from 'react';
import { Student } from '../types';

interface StudentManagerProps {
  students: Student[];
  onAddStudent: (name: string, capability_level: 'high' | 'medium' | 'low') => void;
  onRemoveStudent: (id: string) => void;
  onToggleExclusion: (id: string) => void;
}

export default function StudentManager({
  students,
  onAddStudent,
  onRemoveStudent,
  onToggleExclusion,
}: StudentManagerProps) {
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCapability, setNewStudentCapability] = useState<'high' | 'medium' | 'low'>('medium');

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim(), newStudentCapability);
      setNewStudentName('');
      setNewStudentCapability('medium');
    }
  };

  // **Add this function to handle the Enter key**
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddStudent();
    }
  };

  return (
    <div className="student-manager">
      <h2>Students</h2>
      <div className="student-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Present</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className={!student.present ? 'excluded' : ''}>
                <td>{student.name}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={student.present}
                    onChange={() => onToggleExclusion(student.id)}
                  />
                </td>
                <td>
                  <button className="remove-btn" onClick={() => onRemoveStudent(student.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="add-student">
        <input
          type="text"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
          onKeyDown={handleKeyDown} // **Add this line**
          placeholder="New student name"
        />
        <select
          value={newStudentCapability}
          onChange={(e) => setNewStudentCapability(e.target.value as 'high' | 'medium' | 'low')}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={handleAddStudent}>Add Student</button>
      </div>
    </div>
  );
}