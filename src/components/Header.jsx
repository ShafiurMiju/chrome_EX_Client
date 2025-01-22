import React from "react";

function Header({ setView }) {
  return (
    <header className="bg-blue-600 text-white p-4">
      <h1 className="text-xl font-bold text-center">Browsing History Viewer</h1>
      <div className="mt-4 flex justify-center space-x-4">
        <button
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
          onClick={() => setView("history")}
        >
          View History
        </button>
        <button
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
          onClick={() => setView("screenshots")}
        >
          View Screenshots
        </button>
      </div>
    </header>
  );
}

export default Header;
