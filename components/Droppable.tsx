// components/Droppable.tsx
"use client";

import React, { useState } from 'react';

interface DroppableProps {
  id: string;
  onDrop: (studentId: number) => void;
  children: React.ReactNode;
}

const Droppable: React.FC<DroppableProps> = ({ id, onDrop, children }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const studentId = Number(e.dataTransfer.getData('text/plain'));
    onDrop(studentId);
    setIsOver(false);
  };

  return (
    <div
      id={id}
      className={`droppable ${isOver ? 'group-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Droppable Group"
    >
      {children}
    </div>
  );
};

export default Droppable;