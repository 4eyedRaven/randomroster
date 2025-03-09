// components/CookieConsent.tsx
"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if a cookie consent decision has already been saved
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <p>
        We use cookies strictly for authentication and session management.
        By using our site, you accept our cookie policy.
      </p>
      <div>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
      <style jsx>{`
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #333;
          color: #fff;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
        }
        .cookie-banner button {
          margin-left: 1rem;
          background: var(--primary-color);
          border: none;
          padding: 0.5rem 1rem;
          color: #fff;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}