"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    async function getSessionToken() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
      }
    }
    getSessionToken();
  }, []);

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        credentials: "include", // ensures the session cookie is sent with the request
        headers: {
          // Optionally, include the token if desired
          "Authorization": `Bearer ${token}`
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
  };

  return (
    <button
      onClick={handleDeleteAccount}
      disabled={loading}
      className="delete-account-button"
    >
      {loading ? "Deleting..." : "Delete My Account"}
      <style jsx>{`
        .delete-account-button {
          background: #e74c3c;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </button>
  );
}