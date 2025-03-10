// app/login/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { login, signup } from './actions';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const emailConfirmationSent = searchParams.get('check_email') === 'true';
  const errorParam = searchParams.get('error');
  const errorEmail = searchParams.get('email');

  let errorMessage = "";
  if (errorParam === "invalidCredentials") {
    errorMessage = "Invalid login credentials. Please try again.";
  } else if (errorParam === "signupError") {
    errorMessage = "An error occurred during signup. Please try again.";
  } else if (errorParam === "unknown") {
    errorMessage = "An error occurred. Did you click the confirmation link in the email?";
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container">
        <main>
          <h1 className="title">Random Roster</h1>
          <div className="title-description">Create groups of students for activities.</div>
          {emailConfirmationSent && !errorMessage && (
            <div className="notification">
              A confirmation email has been sent to your inbox. Please click the link in the email to complete your registration.
            </div>
          )}
          {errorMessage && (
            <div className="notification error">
              {errorMessage}
            </div>
          )}
          <div className="login-container">
            <h2>Login or Sign Up</h2>
            <form className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input id="email" name="email" type="email" required defaultValue={errorEmail || ''} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input id="password" name="password" type="password" required />
              </div>
              <div className="form-buttons">
                <button type="submit" formAction={login}>Log in</button>
                <button type="submit" formAction={signup}>Sign up</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Suspense>
  );
}