import React from "react";
import Sidebar from "../components/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex bg-gray-100 h-screen">
      {/* Sidebar */}
      <Sidebar userType="ADMIN" />

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-tl-[20px] overflow-y-auto main-content-scroll">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
