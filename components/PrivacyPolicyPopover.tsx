// components/PrivacyPolicyPopover.tsx
"use client";

import { useState } from "react";

export default function PrivacyPolicyPopover() {
  const [showPopover, setShowPopover] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopover(true);
  };

  const handleClose = () => {
    setShowPopover(false);
  };

  return (
    <>
      <a href="#" onClick={handleOpen} className="footer-link">
        Privacy Policy
      </a>

      {showPopover && (
        <div className="popover-overlay" onClick={handleClose}>
          <div className="popover-container" onClick={(e) => e.stopPropagation()}>
            <button className="popover-close" onClick={handleClose} aria-label="Close">
              &times;
            </button>
            <h2>Privacy Policy</h2>
            <p>
              <strong>Effective Date:</strong> 2025-03-08
            </p>
            <p>
              Random Roster (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application (&quot;Service&quot;).
            </p>
            <h3>Information We Collect</h3>
            <p>
              We collect personal information provided by teachers—including class rosters, student names, and authentication details. All data is stored securely via Supabase.
            </p>
            <h3>How We Use Your Information</h3>
            <p>
              Your information is used solely to enable the functionality of Random Roster: managing class rosters, generating balanced student groups, authenticating users, and maintaining session data. We use your data only for operating and improving the Service.
            </p>
            <h3>Data Sharing and Selling</h3>
            <p>
              We do not sell, trade, or otherwise transfer your personal data to third parties for any commercial purpose. Your information is shared only as necessary to comply with legal obligations or protect our rights.
            </p>
            <h3>Data Retention</h3>
            <p>
              We retain your information only for as long as necessary to provide the Service and to comply with our legal obligations. Once your data is no longer needed, we take steps to securely delete or anonymize it.
            </p>
            <h3>Your Rights</h3>
            <p>
              You have the right to access, correct, and delete your personal information. For account deletion, please use the deletion feature in your profile.
            </p>
            <h3>Our Commitment to Free and Ad‑Free Use</h3>
            <p>
              Random Roster was built by a teacher’s husband specifically for teachers and is provided as a free service. We do not support our app through advertising or by selling your data.
            </p>
            <h3>Cookies and Session Management</h3>
            <p>
              Our Service uses cookies strictly for authentication and session management. These cookies are essential for the operation of the app and do not require additional consent.
            </p>
            <h3>Contact Us</h3>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us at{" "}
              <a href="mailto:contactjoshloughran@gmail.com">contactjoshloughran@gmail.com</a>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}