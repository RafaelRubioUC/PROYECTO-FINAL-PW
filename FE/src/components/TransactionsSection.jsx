import React from "react";

function TransactionsSection() {
  return (
    <section className="dashboard-row">
      <div className="panel-card full-width transactions-panel">
        {/* Encabezado de la sección */}
        <div className="transactions-header">
          <div>
            <h3 className="transactions-title">Transactions</h3>
            <p className="transactions-subtitle">
              Revisa y gestiona tus movimientos recientes.
            </p>
          </div>
          <button className="transactions-add-btn">
            + Add transaction
          </button>
        </div>

        {/* Filtros */}
        <div className="transactions-filters">
          <div className="transactions-search-wrapper">
            <input
              type="text"
              className="transactions-search-input"
              placeholder="Search by description or category..."
            />
          </div>

          <div className="transactions-filter-group">
            <select className="transactions-select">
              <option>All types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>

            <select className="transactions-select">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>This month</option>
              <option>This year</option>
            </select>

            <select className="transactions-select">
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
              <option>Sort: Amount (High → Low)</option>
              <option>Sort: Amount (Low → High)</option>
            </select>
          </div>
        </div>

        {/* Tabla de transacciones (esta es información que usamos de ejemplo) */}
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-11-20</td>
                <td>Grocery Store</td>
                <td>Food &amp; Dining</td>
                <td>
                  <span className="tag-pill tag-pill--expense">
                    Expense
                  </span>
                </td>
                <td>Debit Card</td>
                <td className="amount negative">- $85.20</td>
                <td>
                  <span className="status-pill status-pill--cleared">
                    Cleared
                  </span>
                </td>
              </tr>

              <tr>
                <td>2025-11-19</td>
                <td>Salary - November</td>
                <td>Income</td>
                <td>
                  <span className="tag-pill tag-pill--income">
                    Income
                  </span>
                </td>
                <td>Bank Transfer</td>
                <td className="amount positive">+ $2,500.00</td>
                <td>
                  <span className="status-pill status-pill--cleared">
                    Cleared
                  </span>
                </td>
              </tr>

              <tr>
                <td>2025-11-18</td>
                <td>Coffee Shop</td>
                <td>Leisure</td>
                <td>
                  <span className="tag-pill tag-pill--expense">
                    Expense
                  </span>
                </td>
                <td>Credit Card</td>
                <td className="amount negative">- $4.50</td>
                <td>
                  <span className="status-pill status-pill--pending">
                    Pending
                  </span>
                </td>
              </tr>

              <tr>
                <td>2025-11-17</td>
                <td>Spotify Subscription</td>
                <td>Subscriptions</td>
                <td>
                  <span className="tag-pill tag-pill--expense">
                    Expense
                  </span>
                </td>
                <td>Credit Card</td>
                <td className="amount negative">- $9.99</td>
                <td>
                  <span className="status-pill status-pill--cleared">
                    Cleared
                  </span>
                </td>
              </tr>

              <tr>
                <td>2025-11-15</td>
                <td>Freelance Project</td>
                <td>Side Hustle</td>
                <td>
                  <span className="tag-pill tag-pill--income">
                    Income
                  </span>
                </td>
                <td>PayPal</td>
                <td className="amount positive">+ $650.00</td>
                <td>
                  <span className="status-pill status-pill--cleared">
                    Cleared
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TransactionsSection;