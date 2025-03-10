'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Server-side: Check if passwords match.
  if (password !== confirmPassword) {
    // Redirect back with an error flag.
    redirect(`/register?error=passwordMismatch&email=${encodeURIComponent(email)}`);
  }

  // Enforce password complexity: 
  // Require at least one lowercase, one uppercase, one digit, one special character, and minimum 8 characters.
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!complexityRegex.test(password)) {
    redirect(`/register?error=weakPassword&email=${encodeURIComponent(email)}`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const errMsg = error.message.toLowerCase();
    if (errMsg.includes("already registered") || errMsg.includes("duplicate")) {
      redirect(`/register?error=alreadyRegistered&email=${encodeURIComponent(email)}`);
    } else {
      redirect(`/register?error=signupError`);
    }
  }

  // On successful signup, redirect to login with a flag to check email.
  redirect('/login?check_email=true');
}