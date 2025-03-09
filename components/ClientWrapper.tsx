// components/ClientWrapper.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ErrorBoundary from './ErrorBoundary';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentPath = window.location.pathname;
      // If we're on the login page and a valid session exists, handle both sign in and token refresh events.
      if (currentPath === '/login' && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        window.location.href = '/dashboard';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ClientWrapper;