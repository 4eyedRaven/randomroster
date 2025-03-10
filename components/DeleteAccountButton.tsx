"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Trash } from "lucide-react";

interface DeleteAccountButtonProps {
  className?: string; // allows us to pass extra classes from the parent
}

export default function DeleteAccountButton({ className }: DeleteAccountButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Track what the user types in the confirmation field
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    // Grab the user’s session token if needed
    async function getSessionToken() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
      }
    }
    getSessionToken();
  }, []);

  // Called after user confirms by typing "Delete"
  const handleDeleteAccount = async () => {
    if (confirmText !== "Delete") {
      return; // Safety check; button should be disabled otherwise
    }
    setLoading(true);

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        alert("Error: " + data.error);
      } else {
        alert("Account deleted successfully.");
        router.push("/login");
      }
    } catch (error: any) {
      alert("Network error: " + error.message);
    }

    setLoading(false);
    setShowConfirmModal(false);
    setConfirmText("");
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        className={className}
      >
        <Trash size={16} style={{ marginRight: "8px" }} />
        Delete My Account
      </button>

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowConfirmModal(false)}
              aria-label="Close Modal"
            >
              &times;
            </button>
            <h2>Confirm Account Deletion</h2>
            <p className="modal-text">
              Please type <strong>Delete</strong> to confirm you want to permanently delete your account.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type Delete"
              style={{
                margin: "1rem 0",
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            />

            <div className="modal-buttons">
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== "Delete" || loading}
                className="delete-btn"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button onClick={() => setShowConfirmModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}