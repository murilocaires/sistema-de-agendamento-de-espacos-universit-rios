import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
      <AlertCircle className="text-red-500" size={20} />
      <span className="text-red-700">{error}</span>
    </div>
  );
};

export default ErrorMessage;

