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
    </footer>
  );
}