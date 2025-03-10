// components/ClientHome.tsx
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ClassManager from './ClassManager';
import StudentManager from './StudentManager';
import GroupingTool from './GroupingTool';
import GroupHistory from './GroupHistory';
import Instructions from './Instructions';
import InfoButton from './InfoButton';
import { Class } from '../types';

export default function ClientHome() {
  const supabase = createClient();
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [groupHistoryRefreshKey, setGroupHistoryRefreshKey] = useState<number>(0);

  // Fetch authenticated user on mount.
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    }
    fetchUser();
  }, [supabase]);

  // Load classes from Supabase for the authenticated user.
  useEffect(() => {
    if (user) {
      async function fetchClasses() {
        const { data, error } = await supabase
          .from('classes')
          .select('*, students(*)')
          .eq('user_id', user.id);
        if (!error) {
          // Transform each class so that student records already use snake_case fields.
          // (In this refactor we now expect the database to return capability_level,
          // which matches our interface.)
          setClasses(data);
          if (data.length > 0) {
            setCurrentClassId(data[0].id);
          }
        }
        setLoading(false);
      }
      fetchClasses();
    }
  }, [user, supabase]);

  // Add a new class into Supabase with the current user’s UUID.
  const addClass = async (className: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('classes')
      .insert([{ name: className, user_id: user.id }])
      .select();
    if (!error) {
      const newClass = data[0];
      setClasses([...classes, newClass]);
      setCurrentClassId(newClass.id);
    }
  };

  // Remove a class from Supabase.
  const removeClass = async (classId: string) => {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
    if (!error) {
      const updatedClasses = classes.filter((c) => c.id !== classId);
      setClasses(updatedClasses);
      if (currentClassId === classId) {
        setCurrentClassId(updatedClasses.length > 0 ? updatedClasses[0].id : null);
      }
    }
  };

  // Rename a class in Supabase.
  const renameClass = async (classId: string, newName: string) => {
    const { error } = await supabase
      .from('classes')
      .update({ name: newName })
      .eq('id', classId);
    if (!error) {
      const updatedClasses = classes.map((c) =>
        c.id === classId ? { ...c, name: newName } : c
      );
      setClasses(updatedClasses);
    }
  };

  // Add a new student to the current class.
  const addStudent = async (name: string, capability_level: 'high' | 'medium' | 'low') => {
    if (!currentClassId) return;
    const { data, error } = await supabase
      .from('students')
      .insert([{ class_id: currentClassId, name, capability_level, present: true }])
      .select();
    if (!error) {
      const newStudent = data[0];
      const updatedClasses = classes.map((c) =>
        c.id === currentClassId
          ? { ...c, students: [...(c.students || []), newStudent] }
          : c
      );
      setClasses(updatedClasses);
    }
  };

  // Remove a student from the current class.
  const removeStudent = async (studentId: string) => {
    if (!currentClassId) return;
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);
    if (!error) {
      const updatedClasses = classes.map((c) =>
        c.id === currentClassId
          ? { ...c, students: c.students.filter((s) => s.id !== studentId) }
          : c
      );
      setClasses(updatedClasses);
    }
  };

  // Toggle student presence in the current class.
  const toggleStudentExclusion = async (studentId: string) => {
    if (!currentClassId) return;
    const currentClass = classes.find((c) => c.id === currentClassId);
    if (!currentClass) return;
    const student = currentClass.students.find((s) => s.id === studentId);
    if (!student) return;
    const newPresent = !student.present;
    const { error } = await supabase
      .from('students')
      .update({ present: newPresent })
      .eq('id', studentId);
    if (!error) {
      const updatedClasses = classes.map((c) =>
        c.id === currentClassId
          ? {
              ...c,
              students: c.students.map((s) =>
                s.id === studentId ? { ...s, present: newPresent } : s
              ),
            }
          : c
      );
      setClasses(updatedClasses);
    }
  };

  const triggerGroupHistoryRefresh = () => {
    setGroupHistoryRefreshKey((prevKey) => prevKey + 1);
  };

  if (loading) return <p>Loading...</p>;

  const currentClass = classes.find((c) => c.id === currentClassId) || null;

  return (
    <div className="client-home-container">
      <InfoButton visible={classes.length > 0} />

      <ClassManager
        classes={classes}
        currentClassId={currentClassId}
        onAddClass={addClass}
        onRemoveClass={removeClass}
        onSelectClass={setCurrentClassId}
        onRenameClass={renameClass}
      />

      {!classes.length && <Instructions />}

      {currentClass && (
        <>
          <StudentManager
            students={currentClass.students || []}
            onAddStudent={addStudent}
            onRemoveStudent={removeStudent}
            onToggleExclusion={toggleStudentExclusion}
          />
          <GroupingTool
            students={currentClass.students ? currentClass.students.filter((s) => s.present) : []}
            currentClassId={currentClassId}
            onGroupingSaved={triggerGroupHistoryRefresh}
          />
          <GroupHistory
            currentClassId={currentClassId}
            className={currentClass.name}
            refreshKey={groupHistoryRefreshKey}
          />
        </>
      )}
    </div>
  );
}