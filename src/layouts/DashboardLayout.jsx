import React from "react";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children, userType = "ADMIN", menuItems = [] }) => {
  return (
    <div className="flex bg-gray-100 h-screen">
      {/* Sidebar */}
      <Sidebar userType={userType} menuItems={menuItems} />

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-tl-[20px] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
