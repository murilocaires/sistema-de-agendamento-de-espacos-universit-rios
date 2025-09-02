import React from "react";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-tl-[20px] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
