// components/PasswordInput.tsx
"use client";

import { useState, useEffect } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PasswordInput({ value, onChange, placeholder }: PasswordInputProps) {
  // Define the password rules.
  const rules = [
    {
      label: "At least 8 characters",
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      label: "One uppercase letter",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      label: "One lowercase letter",
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      label: "One number",
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      label: "One special character (@$!%*?&)",
      test: (pwd: string) => /[@$!%*?&]/.test(pwd),
    },
  ];

  const [showRules, setShowRules] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter your password"}
        onFocus={() => setShowRules(true)}
        onBlur={() => setShowRules(false)}
      />
      {showRules && (
        <ul className="password-rules">
          {rules.map((rule, index) => (
            <li key={index} className={rule.test(value) ? "passed" : "failed"}>
              {rule.test(value) ? "✓" : "✗"} {rule.label}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .password-input-wrapper {
          position: relative;
        }
        .password-rules {
          list-style: none;
          padding: 0.5rem;
          margin: 0.25rem 0 0;
          background: var(--border-color);
          border: 1px solid var(--primary-color);
          border-radius: 4px;
          font-size: 0.85rem;
          position: absolute;
          left: 0;
          right: 0;
          z-index: 10;
        }
        .password-rules li {
          margin: 0.25rem 0;
        }
        .password-rules li.passed {
          color: green;
        }
        .password-rules li.failed {
          color: red;
        }
      `}</style>
    </div>
  );
}