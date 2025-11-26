import React, { useState, useRef, useEffect } from "react";
import {
  FiHome,
  FiList,
  FiPieChart,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiCreditCard,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("recap");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sectionTitles = {
    recap: "Recap",
    transactions: "Transactions",
    budget: "Budget",
    reports: "Reports",
    settings: "Settings",
  };

  const sectionSubtitles = {
    recap: "Resumen de tus finanzas personales",
    transactions: "Gestiona y revisa tus movimientos",
    budget: "Configura tus presupuestos por categoría",
    reports: "Visualiza reportes y estadísticas",
    settings: "Configura tu cuenta y preferencias",
  };

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  // Account dropdown state and ref
  const accountRef = useRef(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [userData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    joinDate: "Jan 2023",
  });

  // Handle sign out
  const handleSignOut = () => {
    // Limpiar sesión del localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Cerrar el dropdown
    setAccountOpen(false);
    
    // Redirigir a login (cambiar según tu estructura de rutas)
    window.location.href = "/login";
  };

  useEffect(() => {
    function handleDocClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  return (
    <div
      className={`dashboard-layout ${
        sidebarCollapsed ? "dashboard-layout--collapsed" : ""
      }`}
    >
      {/* Overlay para móvil (drawer). Sólo se muestra cuando el sidebar está abierto */}
      {!sidebarCollapsed && (
        <div className="sidebar-backdrop" onClick={toggleSidebar} />
      )}

      {/* Botón flotante para colapsar / expandir sidebar */}
      <button type="button" className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`dashboard-sidebar ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-logo">
          <img
            src="/assets/logo-icon.jpeg"
            alt="SpendList logo"
            className="sidebar-logo-img"
          />
          <span className="sidebar-logo-text">
            Spend<span>List</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${
              activeTab === "recap" ? "active" : ""
            }`}
            onClick={() => setActiveTab("recap")}
          >
            <FiHome />
            <span>Recap</span>
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "transactions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            <FiList />
            <span>Transactions</span>
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "budget" ? "active" : ""
            }`}
            onClick={() => setActiveTab("budget")}
          >
            <FiPieChart />
            <span>Budget</span>
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "reports" ? "active" : ""
            }`}
            onClick={() => setActiveTab("reports")}
          >
            <FiBarChart2 />
            <span>Reports</span>
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "settings" ? "active" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <FiSettings />
            <span>Settings</span>
          </button>
        </nav>

        {/* Account with dropdown */}
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
              <span className="sidebar-account-name">John Doe</span>
              <span className="sidebar-account-role">john.doe@example.com</span>
            </div>
          </button>

          {accountOpen && (
            <div className="account-dropdown-menu" role="menu">
              <div className="account-dropdown-header">
                <div className="account-dropdown-avatar">
                  <FiUser />
                </div>
                <div className="account-dropdown-meta">
                  <div className="account-dropdown-name">John Doe</div>
                  <div className="account-dropdown-email">john.doe@example.com</div>
                </div>
              </div>

              <button
                className="account-menu-item"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(true);
                  setAccountOpen(false);
                }}
              >
                <FiUser className="account-menu-icon" /> Profile
              </button>

              <button className="account-menu-item" role="menuitem">
                <FiCreditCard className="account-menu-icon" /> Billing
              </button>

              <button className="account-menu-item" role="menuitem">
                <FiHelpCircle className="account-menu-icon" /> Help & Support
              </button>

              <button 
                className="account-menu-item account-menu-item--logout" 
                role="menuitem"
                onClick={handleSignOut}
              >
                <FiLogOut className="account-menu-icon" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{sectionTitles[activeTab]}</h1>
            <p className="dashboard-subtitle">
              {sectionSubtitles[activeTab]}
            </p>
          </div>
        </header>

        {/* ===== RECAP ===== */}
        {activeTab === "recap" && (
          <>
            {/* Tarjetas superiores */}
            <section className="dashboard-row">
              <div className="summary-card">
                <p className="summary-label">Total Balance</p>
                <h2 className="summary-value">$12,345</h2>
                <p className="summary-change positive">
                  ↑ 12% from last month
                </p>
              </div>

              <div className="summary-card">
                <p className="summary-label">Income</p>
                <h2 className="summary-value">$5,678</h2>
                <p className="summary-change positive">
                  ↑ 8% from last month
                </p>
              </div>

              <div className="summary-card">
                <p className="summary-label">Expenses</p>
                <h2 className="summary-value">$3,210</h2>
                <p className="summary-change negative">
                  ↓ 5% from last month
                </p>
              </div>
            </section>

            {/* Presupuesto mensual + transacciones recientes */}
            <section className="dashboard-row dashboard-row--middle">
              {/* Presupuesto mensual */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Monthly Budget</h3>
                </div>

                <div className="budget-item">
                  <div className="budget-label-row">
                    <span>Food &amp; Dining</span>
                    <span className="budget-amount">$450 / $600</span>
                  </div>
                  <div className="budget-bar">
                    <div
                      className="budget-bar-fill budget-bar-fill--green"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>

                <div className="budget-item">
                  <div className="budget-label-row">
                    <span>Transportation</span>
                    <span className="budget-amount">$180 / $300</span>
                  </div>
                  <div className="budget-bar">
                    <div
                      className="budget-bar-fill budget-bar-fill--yellow"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>

                <div className="budget-item">
                  <div className="budget-label-row">
                    <span>Entertainment</span>
                    <span className="budget-amount">$120 / $200</span>
                  </div>
                  <div className="budget-bar">
                    <div
                      className="budget-bar-fill budget-bar-fill--red"
                      style={{ width: "80%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Transacciones recientes */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3>Recent Transactions</h3>
                </div>

                <ul className="transactions-list">
                  <li className="transaction-item">
                    <div className="transaction-icon transaction-icon--green">
                      🛒
                    </div>
                    <div className="transaction-info">
                      <span className="transaction-title">
                        Grocery Store
                      </span>
                      <span className="transaction-meta">
                        Today, 10:30 AM
                      </span>
                    </div>
                    <span className="transaction-amount negative">
                      - $85.20
                    </span>
                  </li>

                  <li className="transaction-item">
                    <div className="transaction-icon transaction-icon--blue">
                      💼
                    </div>
                    <div className="transaction-info">
                      <span className="transaction-title">Salary</span>
                      <span className="transaction-meta">
                        Yesterday, 9:00 AM
                      </span>
                    </div>
                    <span className="transaction-amount positive">
                      + $2,500.00
                    </span>
                  </li>

                  <li className="transaction-item">
                    <div className="transaction-icon transaction-icon--purple">
                      ☕
                    </div>
                    <div className="transaction-info">
                      <span className="transaction-title">Coffee Shop</span>
                      <span className="transaction-meta">
                        Yesterday, 4:15 PM
                      </span>
                    </div>
                    <span className="transaction-amount negative">
                      - $4.50
                    </span>
                  </li>
                </ul>

                <button className="transactions-view-all">
                  View All Transactions
                </button>
              </div>
            </section>

            {/* Overview / gráfico (placeholder) */}
            <section className="dashboard-row">
              <div className="panel-card full-width">
                <div className="panel-header panel-header--with-filter">
                  <h3>Spending Overview</h3>
                  <select className="panel-filter">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="chart-placeholder">
                  Chart will be displayed here
                </div>
              </div>
            </section>
          </>
        )}

        {/* ===== PLACEHOLDERS PARA LAS DEMÁS SECCIONES ===== */}

        {activeTab === "transactions" && (
          <section className="dashboard-row">
            <div className="panel-card full-width">
              <div className="panel-header">
                <h3>Transactions</h3>
              </div>
              <div className="chart-placeholder">
                Aquí irá la tabla de transacciones.
              </div>
            </div>
          </section>
        )}

        {activeTab === "budget" && (
          <section className="dashboard-row">
            <div className="panel-card full-width">
              <div className="panel-header">
                <h3>Budget</h3>
              </div>
              <div className="chart-placeholder">
                Aquí configuraremos los presupuestos por categoría.
              </div>
            </div>
          </section>
        )}

        {activeTab === "reports" && (
          <section className="dashboard-row">
            <div className="panel-card full-width">
              <div className="panel-header">
                <h3>Reports</h3>
              </div>
              <div className="chart-placeholder">
                Aquí mostraremos gráficos y reportes detallados.
              </div>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="dashboard-row">
            <div className="panel-card full-width">
              <div className="panel-header">
                <h3>Settings</h3>
              </div>
              <div className="chart-placeholder">
                Aquí podrás editar tu información y preferencias.
              </div>
            </div>
          </section>
        )}
      </main>

      {profileOpen && (
        <div className="profile-modal-overlay" onClick={() => setProfileOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2 style={{ margin: 0 }}>Profile</h2>
              <button className="btn-close" onClick={() => setProfileOpen(false)} aria-label="Close profile">×</button>
            </div>

            <div className="profile-modal-body">
              <div className="profile-avatar">
                {userData.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              <div className="profile-info-grid">
                <div>
                  <div className="profile-info-label">Name</div>
                  <div className="profile-info-value">{userData.name}</div>
                </div>
                <div>
                  <div className="profile-info-label">Email</div>
                  <div className="profile-info-value">{userData.email}</div>
                </div>
                <div>
                  <div className="profile-info-label">Phone</div>
                  <div className="profile-info-value">{userData.phone}</div>
                </div>
                <div>
                  <div className="profile-info-label">Location</div>
                  <div className="profile-info-value">{userData.location}</div>
                </div>
                <div>
                  <div className="profile-info-label">Member since</div>
                  <div className="profile-info-value">{userData.joinDate}</div>
                </div>
              </div>
            </div>

            <div className="profile-modal-actions">
              <button className="btn-secondary" onClick={() => setProfileOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;