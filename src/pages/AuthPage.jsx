import React, { useState } from "react";
import Login from "./login/Login";
import Register from "./register/Register";

const AuthPage = () => {
  const [currentView, setCurrentView] = useState("login");

  const showRegister = () => {
    setCurrentView("register");
  };

  const showLogin = () => {
    setCurrentView("login");
  };

  return (
    <>
      {currentView === "login" ? (
        <Login onShowRegister={showRegister} />
      ) : (
        <Register onBackToLogin={showLogin} />
      )}
    </>
  );
};

export default AuthPage;
