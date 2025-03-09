// components/Footer.tsx
"use client";

import PrivacyPolicyPopover from "./PrivacyPolicyPopover";

export default function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Random Roster. All rights reserved.</p>
      <nav>
        <PrivacyPolicyPopover />
      </nav>
      <style jsx>{`
        .footer {
          padding: 1rem;
          background-color: var(--border-color);
          color: var(--text-color);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .footer nav {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
      `}</style>
    </footer>
  );
}