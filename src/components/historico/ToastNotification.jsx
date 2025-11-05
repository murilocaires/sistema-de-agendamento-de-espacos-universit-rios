import React from "react";

const ToastNotification = ({ show, message, type, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`px-6 py-3 rounded-lg shadow-lg flex items-center ${
          type === "success"
            ? "bg-green-500 text-white"
            : type === "error"
            ? "bg-red-500 text-white"
            : "bg-blue-500 text-white"
        }`}
      >
        <span className="mr-2">
          {type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}
        </span>
        {message}
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;

