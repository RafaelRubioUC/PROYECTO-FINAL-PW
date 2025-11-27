import React from "react";

function RecapSection() {
  return (
    <>
      {/* Tarjetas superiores */}
      <section className="dashboard-row">
        <div className="summary-card">
          <p className="summary-label">Total Balance</p>
          <h2 className="summary-value">$12,345</h2>
          <p className="summary-change positive">↑ 12% from last month</p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Income</p>
          <h2 className="summary-value">$5,678</h2>
          <p className="summary-change positive">↑ 8% from last month</p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Expenses</p>
          <h2 className="summary-value">$3,210</h2>
          <p className="summary-change negative">↓ 5% from last month</p>
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
                <span className="transaction-title">Grocery Store</span>
                <span className="transaction-meta">Today, 10:30 AM</span>
              </div>
              <span className="transaction-amount negative">- $85.20</span>
            </li>

            <li className="transaction-item">
              <div className="transaction-icon transaction-icon--blue">
                💼
              </div>
              <div className="transaction-info">
                <span className="transaction-title">Salary</span>
                <span className="transaction-meta">Yesterday, 9:00 AM</span>
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
              <span className="transaction-amount negative">- $4.50</span>
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
  );
}

export default RecapSection;