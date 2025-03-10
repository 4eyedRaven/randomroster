"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { logout } from "../app/dashboard/actions";
import DeleteAccountButton from "./DeleteAccountButton";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="hamburger-menu">
      <button
        onClick={toggleMenu}
        aria-label="Toggle menu"
        className="hamburger-button"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="menu-content">
          <button onClick={handleLogout} className="menu-item">
            Log Out
          </button>
          {/* 
            Pass a custom class so we can style 
            the Delete My Account button specifically
          */}
          <DeleteAccountButton className="menu-item delete-button" />
        </div>
      )}
    </div>
  );
}