// components/ImportRosterPopover.tsx
"use client";

import { useState } from "react";

export default function ImportRosterPopover() {
  const [showPopover, setShowPopover] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPopover(true);
  };

  const handleClose = () => {
    setShowPopover(false);
  };

  return (
    <>
      <button type="button" onClick={handleOpen} className="menu-item">
        Import Roster
      </button>

      {showPopover && (
        <div className="popover-overlay" onClick={handleClose}>
          <div className="popover-container" onClick={(e) => e.stopPropagation()}>
            <button className="popover-close" onClick={handleClose} aria-label="Close">
              &times;
            </button>
            <h2>Import Roster</h2>
            <form method="POST" action="/api/import" encType="multipart/form-data">
              <input type="file" name="file" accept=".csv" required />
              <button type="submit">Upload</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}