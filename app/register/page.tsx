// app/register/page.tsx
"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { registerUser } from './actions';
import PasswordInput from '@/components/PasswordInput';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get('error');
  const errorMessage =
    errorParam === "signupError"
      ? "An error occurred during signup. Please try again."
      : errorParam === "alreadyRegistered"
      ? "User already registered."
      : errorParam === "passwordMismatch"
      ? "Passwords do not match."
      : errorParam === "weakPassword"
      ? "Password does not meet complexity requirements."
      : "";

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let valid = true;
    const errors = { email: '', password: '', confirmPassword: '' };

    // Email validation.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address.";
      valid = false;
    }

    // Password length check (other rules are shown in the PasswordInput component).
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
      valid = false;
    }

    // Check that passwords match.
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      await registerUser(formData);
      router.push('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <main>
        <h1 className="title">Register for Random Roster</h1>
        {errorMessage && (
          <div className="notification error">
            {errorMessage}
          </div>
        )}
        <div className="register-container">
          <h2>Register</h2>
          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {formErrors.email && <div className="error-message">{formErrors.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Enter a strong password"
              />
              {formErrors.password && <div className="error-message">{formErrors.password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your password"
              />
              {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
            </div>
            <div className="form-buttons">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </form>
          <div className="redirect-login">
            <p>
              Already have an account? <a href="/login">Log in here</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}