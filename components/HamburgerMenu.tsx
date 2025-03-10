"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { logout } from "../app/dashboard/actions";
import DeleteAccountButton from "./DeleteAccountButton";
import ImportRosterPopover from "./ImportRosterPopover";
import Instructions from "./Instructions";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    await logout();
  };

  const handleExport = () => {
    window.open("/api/export", "_blank");
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
          <button onClick={handleExport} className="menu-item">
            Export Data
          </button>
          <ImportRosterPopover />
          <button
            onClick={() => setShowInstructions(true)}
            className="menu-item"
          >
            Instructions
          </button>
          <DeleteAccountButton className="menu-item delete-button" />
        </div>
      )}

      {showInstructions && (
        <div
          className="popover-overlay-simple"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="popover-container-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInstructions(false)}
              className="popover-close-simple"
              aria-label="Close instructions"
            >
              &times;
            </button>
            <Instructions />
          </div>
        </div>
      )}
    </div>
  );
}