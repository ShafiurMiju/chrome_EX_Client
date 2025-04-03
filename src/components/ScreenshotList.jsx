import React, { useEffect, useState } from "react";
import axios from "axios";

function ScreenshotList() {
  const [screenshots, setScreenshots] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  //const apiUrl = process.env.REACT_APP_API_BASE_URL;


  // Date filter state
  const [filterDate, setFilterDate] = useState("");

  const ITEMS_PER_PAGE = 1000;

  useEffect(() => {
    fetchScreenshots(currentPage, filterDate);
  }, [currentPage, filterDate]);

  // Delete all screenshots for the selected date
  const deleteAllImages = async (date) => {
    if (!date) return;
    if (
      !window.confirm(`Are you sure you want to delete all images for ${date}?`)
    ) {
      return;
    }

    setDeletingAll(true);
    try {
      const formattedDate = new Date(date).toISOString();
      await axios.delete(`https://colton-database.vercel.app/api/screenshots`, {
        data: { date: formattedDate },
      });

      alert(`All images for ${date} have been deleted.`);
      setFilterDate(""); // Reset the filter
      setCurrentPage(1); // Reset pagination
      fetchScreenshots(1); // Fetch updated data
    } catch (err) {
      console.error("Error deleting images for the selected date:", err);
      alert("Failed to delete images for the selected date.");
    } finally {
      setDeletingAll(false);
    }
  };

  // Fetch screenshots with pagination and date filter
  const fetchScreenshots = async (page, filterDate = "") => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://colton-database.vercel.app/api/screenshots`,
        {
          params: { page, limit: ITEMS_PER_PAGE, filterDate },
        }
      );

      setScreenshots(response.data.screenshots);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching screenshots:", err);
      setError("Failed to load screenshots.");
      setLoading(false);
    }
  };

  // Reload screenshots without changing the page
  const reloadScreenshots = async () => {
    setRefreshing(true);
    try {
      await fetchScreenshots(currentPage, filterDate);
    } catch (err) {
      console.error("Error refreshing screenshots:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle page changes
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate pagination numbers dynamically
  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "skip", totalPages);
      } else if (currentPage > totalPages - 4) {
        pages.push(
          1,
          "skip",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "skip",
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2,
          "skip",
          totalPages
        );
      }
    }
    return pages;
  };

  // Clear the date filter
  const clearFilter = () => {
    setFilterDate("");
    setCurrentPage(1);
  };

  // Delete a screenshot
  const deleteScreenshot = async (id) => {
    setDeletingId(id);

    try {
      await axios.delete(`https://colton-database.vercel.app/api/screenshots/${id}`);

      setScreenshots((prev) =>
        prev.filter((screenshot) => screenshot._id !== id)
      );
      setTotalCount((prev) => prev - 1);

      // Handle deletion in full-screen mode
      if (fullscreenIndex !== null) {
        if (fullscreenIndex < screenshots.length - 1) {
          setFullscreenIndex(fullscreenIndex); // Stay on the same index
        } else if (fullscreenIndex > 0) {
          setFullscreenIndex(fullscreenIndex - 1); // Move to the previous screenshot
        } else {
          setFullscreenIndex(null); // Close full-screen view if no screenshots remain
        }
      }
    } catch (err) {
      console.error("Error deleting screenshot:", err);
      alert("Failed to delete screenshot.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open full-screen view
  const openFullscreen = (index) => {
    setFullscreenIndex(index);
  };

  // Close full-screen view
  const closeFullscreen = () => {
    setFullscreenIndex(null);
  };

  // Navigate to the previous screenshot
  const previousScreenshot = () => {
    setFullscreenIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  // Navigate to the next screenshot
  const nextScreenshot = () => {
    setFullscreenIndex((prevIndex) =>
      prevIndex < screenshots.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  if (loading) {
    return <p className="text-center mt-4">Loading screenshots...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">{error}</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Screenshot Viewer</h1>
        <div className="flex items-center space-x-4">
          <p className="text-gray-600">Total Screenshots: {totalCount}</p>
          <button
            onClick={reloadScreenshots}
            className={`px-4 py-2 rounded ${
              refreshing
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Reload"}
          </button>
        </div>
      </div>

      {/* Date Filter */}
      {/* Date Filter with Delete Button */}
      <div className="flex items-center space-x-4 mb-6 bg-white p-4 rounded shadow">
        <label className="block text-gray-700 font-semibold mb-2 text-sm">
          Filter by Date:
        </label>
        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        <button
          onClick={clearFilter}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filterDate
              ? "bg-gray-500 text-white hover:bg-gray-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!filterDate}
        >
          Clear Filter
        </button>
        <button
          onClick={() => deleteAllImages(filterDate)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filterDate && !deletingAll
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!filterDate || deletingAll}
        >
          {deletingAll ? "Deleting..." : "Delete All for Date"}
        </button>
      </div>

      {/* Screenshot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screenshots.map((item, index) => (
          <div key={item._id} className="bg-white shadow rounded p-4">
            <img
              src={item.screenshot}
              alt="Screenshot"
              className="w-full h-48 object-cover rounded cursor-pointer"
              onClick={() => openFullscreen(index)}
            />
            <p className="text-sm text-gray-600 mt-2">
              Captured at: {new Date(item.timestamp).toLocaleString()}
            </p>
            <button
              onClick={() => deleteScreenshot(item._id)}
              className={`mt-4 w-full py-2 rounded ${
                deletingId === item._id
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              disabled={deletingId === item._id}
            >
              {deletingId === item._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>

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

        {getPaginationNumbers().map((page, index) =>
          page === "skip" ? (
            <span key={index} className="px-2">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          )
        )}

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

      {/* Full-Screen View */}
      {fullscreenIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <button
            className="absolute left-4 text-white text-2xl"
            onClick={previousScreenshot}
            disabled={fullscreenIndex === 0}
          >
            ◀
          </button>
          <img
            src={screenshots[fullscreenIndex].screenshot}
            alt="Fullscreen Screenshot"
            className="max-h-full max-w-full rounded shadow"
          />
          <button
            className="absolute right-4 text-white text-2xl"
            onClick={nextScreenshot}
            disabled={fullscreenIndex === screenshots.length - 1}
          >
            ▶
          </button>
          <button
            className={`absolute bottom-4 right-4 text-white text-lg px-4 py-2 rounded ${
              deletingId === screenshots[fullscreenIndex]._id
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={() => deleteScreenshot(screenshots[fullscreenIndex]._id)}
            disabled={deletingId === screenshots[fullscreenIndex]._id}
          >
            {deletingId === screenshots[fullscreenIndex]._id
              ? "Deleting..."
              : "Delete"}
          </button>
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={closeFullscreen}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default ScreenshotList;
