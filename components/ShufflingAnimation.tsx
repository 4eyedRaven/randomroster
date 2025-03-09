// components/ShufflingAnimation.tsx
"use client";

import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Student } from '../types';

interface ShufflingAnimationProps {
  students: Student[];
  onAnimationComplete: () => void;
}

const ShufflingAnimation: React.FC<ShufflingAnimationProps> = ({ students, onAnimationComplete }) => {
  const controls = useAnimationControls();

  useEffect(() => {
    const sequence = async () => {
      // Initial positions: students scattered randomly
      await controls.start((i) => ({
        x: Math.random() * 600 - 300,
        y: Math.random() * 400 - 200,
        scale: 1,
        transition: { duration: 0 },
      }));

      // Shuffle animation: students move randomly several times
      for (let j = 0; j < 3; j++) {
        await controls.start((i) => ({
          x: Math.random() * 600 - 300,
          y: Math.random() * 400 - 200,
          rotate: Math.random() * 360 - 180,
          transition: { duration: 0.5, ease: 'easeInOut' },
        }));
      }

      // Gather students to center
      await controls.start((i) => ({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { duration: 0.5, ease: 'easeInOut' },
      }));

      // Fade out students
      await controls.start((i) => ({
        scale: 0,
        opacity: 0,
        transition: { duration: 0.5, ease: 'easeInOut' },
      }));

      // Call the completion handler
      onAnimationComplete();
    };

    sequence();
  }, [controls, onAnimationComplete]);

  return (
    <div className="shuffling-animation-container">
      {students.map((student, index) => (
        <motion.div
          key={student.id}
          className="student-name"
          animate={controls}
          custom={index}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        >
          {student.name}
        </motion.div>
      ))}

      {/* Styles */}
      <style jsx>{`
        .shuffling-animation-container {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
        }
        .student-name {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background-color: var(--primary-color);
          color: var(--bg-color);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          white-space: nowrap;
          font-size: 1rem;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ShufflingAnimation;