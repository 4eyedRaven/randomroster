// components/HamburgerMenu.tsx
"use client";

import { useState } from "react";
import { Menu, X, LogOut, Download, Upload, Info } from "lucide-react";
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
            <LogOut size={16} style={{ marginRight: "8px" }} />
            Log Out
          </button>
          <button onClick={handleExport} className="menu-item">
            <Download size={16} style={{ marginRight: "8px" }} />
            Export Data
          </button>
          {/* Ensure your ImportRosterPopover also displays an icon.
              For example, update its button to include the Upload icon. */}
          <ImportRosterPopover />
          <button
            onClick={() => setShowInstructions(true)}
            className="menu-item"
          >
            <Info size={16} style={{ marginRight: "8px" }} />
            Instructions
          </button>
          {/* Optionally, update DeleteAccountButton to include an icon (e.g., a Trash icon)
              or wrap it similarly if you want consistent styling. */}
          <DeleteAccountButton className="menu-item" />
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