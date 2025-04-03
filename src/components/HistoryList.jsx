import React, { useEffect, useState } from "react";
import axios from "axios";

function HistoryList() {
  const [history, setHistory] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [deletingDate, setDeletingDate] = useState(null); // Track which date is being deleted

  //const apiUrl = import.meta.env.REACT_APP_API_BASE_URL;


  const ITEMS_PER_PAGE = 2000;

  useEffect(() => {
    fetchHistory(currentPage, filterDate);
  }, [currentPage, filterDate]);

  // Fetch history data
  const fetchHistory = async (page, filterDate) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://colton-database.vercel.app/api/history`, {
        params: { page, limit: ITEMS_PER_PAGE, filterDate },
      });
      const groupedData = groupByDate(response.data.history); // Group history by date
      setHistory(groupedData);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load browsing history.");
      setLoading(false);
    }
  };

  // Group history items by date
  const groupByDate = (data) => {
    return data.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle delete a single history item
  const deleteHistoryItem = async (id, date) => {
    try {
      await axios.delete(`https://colton-database.vercel.app/api/history/${id}`);
      const updatedHistory = { ...history };
      updatedHistory[date] = updatedHistory[date].filter((item) => item._id !== id);
      if (updatedHistory[date].length === 0) {
        delete updatedHistory[date];
      }
      setHistory(updatedHistory);
    } catch (err) {
      console.error("Error deleting history item:", err);
      alert("Failed to delete history item.");
    }
  };

  // Handle delete all history for a specific date
  const deleteAllForDate = async (date) => {
    setDeletingDate(date); // Indicate which date is being deleted
    try {
      await axios.delete(`https://colton-database.vercel.app/api/history`, {
        data: { date }, // Pass the date to the backend
      });
      const updatedHistory = { ...history };
      delete updatedHistory[date]; // Remove the entire date section
      setHistory(updatedHistory);
      alert(`All history for ${date} has been deleted.`);
    } catch (err) {
      console.error("Error deleting history for date:", err);
      alert("Failed to delete history for this date.");
    } finally {
      setDeletingDate(null); // Reset the deleting date state
    }
  };

  // Handle clear filter
  const clearFilter = () => {
    setFilterDate("");
  };

  if (loading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">{error}</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 max-w-4xl mx-auto">
      {/* Filter Section */}
      <div className="mb-6 bg-white p-4 rounded shadow flex items-center justify-between">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <label htmlFor="filter-date" className="block text-gray-700 font-semibold">
            Filter by Date:
          </label>
          <input
            id="filter-date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          />
        </div>
        <button
          onClick={clearFilter}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filterDate
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!filterDate}
        >
          Clear Filter
        </button>
      </div>

      {/* History List Grouped by Date */}
      {Object.keys(history).map((date) => (
        <div key={date} className="mb-6">
          {/* Date Header */}
          <div className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded">
            <h3 className="text-lg font-semibold text-gray-700">{date}</h3>
            <button
              onClick={() => deleteAllForDate(date)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                deletingDate === date
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              disabled={deletingDate === date}
            >
              {deletingDate === date ? "Deleting..." : "Delete All"}
            </button>
          </div>
          <ul className="mt-2">
            {history[date].map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center bg-white shadow-sm p-4 rounded mb-2"
              >
                <div className="w-full">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-words"
                  >
                    {item.url}
                  </a>
                  <p className="text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteHistoryItem(item._id, date)}
                  className="ml-4 text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded ${
              index + 1 === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default HistoryList;
