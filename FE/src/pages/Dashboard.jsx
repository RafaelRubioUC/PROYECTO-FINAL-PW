import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiPieChart,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";

import RecapSection from "../components/RecapSection";
import TransactionsSection from "../components/TransactionsSection";
import BudgetSection from "../components/BudgetSection";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recap");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 🔹 Estado para el botón / menú de Account
  const [accountOpen, setAccountOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("spendlist_user") || window.localStorage.getItem("user");

      if (raw) {
        const parsed = JSON.parse(raw);
        setUserData({
          id: parsed.id ?? parsed._id,
          name: parsed.name,
          email: parsed.email,
        });
      }
    } catch (err) {
      console.error("Error leyendo datos de usuario:", err);
    }
  }, []);

  const displayName = userData?.name || "User";
  const displayEmail = userData?.email || "user@example.com";

  const accountRef = useRef(null);

  const sectionTitles = {
    recap: "Recap",
    transactions: "Transacciones",
    budget: "Presupuesto",
  };

  const sectionSubtitles = {
    recap: "Resumen mensual de tus finanzas personales",
    transactions: "Gestiona y revisa tus movimientos",
    budget: "Visualiza el presupuesto asignado a tus categorías",
  };

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  // 🔹 Cerrar el menú de Account si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("spendlist_token");
    localStorage.removeItem("spendlist_user");
    navigate("/login");
  };

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? "dashboard-layout--collapsed" : ""}`}>
      {/* Botón flotante para colapsar / expandir sidebar */}
      <button type="button" className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      {/* ===== SIDEBAR ===== */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <img src="/assets/logo-icon.jpeg" alt="SpendList logo" className="sidebar-logo-img" />
          <span className="sidebar-logo-text">
            Spend<span>List</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeTab === "recap" ? "active" : ""}`}
            onClick={() => setActiveTab("recap")}
          >
            <FiHome />
            <span>Recap</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <FiList />
            <span>Transactions</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === "budget" ? "active" : ""}`}
            onClick={() => setActiveTab("budget")}
          >
            <FiPieChart />
            <span>Budget</span>
          </button>
        </nav>

        {/* 🔻 Account pegado abajo con dropdown */}
        <div className="sidebar-account-container" ref={accountRef}>
          <button
            className="sidebar-account"
            type="button"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((s) => !s)}
          >
            <div className="sidebar-account-icon">
              <FiUser />
            </div>
            <div className="sidebar-account-info">
              <span className="sidebar-account-name">{displayName}</span>
              <span className="sidebar-account-role">{displayEmail}</span>
            </div>
          </button>

          {accountOpen && (
            <div className="account-dropdown-menu" role="menu">
              {/* Cabecera con avatar, nombre y email */}
              <div className="account-dropdown-header">
                <div className="account-dropdown-avatar">
                  <FiUser />
                </div>
                <div>
                  <div className="account-dropdown-name">{displayName}</div>
                  <div className="account-dropdown-email">{displayEmail}</div>
                </div>
              </div>

              {/* Lista de opciones */}
              <div className="account-dropdown-list">
                <button type="button" className="account-dropdown-item">
                  <FiUser />
                  <span>Profile</span>
                </button>

                <button type="button" className="account-dropdown-item">
                  <FiSettings />
                  <span>Settings</span>
                </button>

                <button type="button" className="account-dropdown-item">
                  <FiHelpCircle />
                  <span>Help &amp; Support</span>
                </button>

                <button
                  type="button"
                  className="account-dropdown-item account-dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{sectionTitles[activeTab]}</h1>
            <p className="dashboard-subtitle">{sectionSubtitles[activeTab]}</p>
          </div>
        </header>

        {activeTab === "recap" && <RecapSection onViewAllTransactions={() => setActiveTab("transactions")} />}

        {activeTab === "transactions" && <TransactionsSection />}

        {activeTab === "budget" && <BudgetSection />}
      </main>
    </div>
  );
};

export default Dashboard;
