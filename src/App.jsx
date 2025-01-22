import React, { useState } from "react";
import Header from "./components/Header";
import HistoryList from "./components/HistoryList";
import ScreenshotList from "./components/ScreenshotList";

function App() {
  const [view, setView] = useState("history");

  return (
    <div className="min-h-screen bg-gray-100">
      <Header setView={setView} />
      <main className="p-4">
        {view === "history" ? <HistoryList /> : <ScreenshotList />}
      </main>
    </div>
  );
}

export default App;
