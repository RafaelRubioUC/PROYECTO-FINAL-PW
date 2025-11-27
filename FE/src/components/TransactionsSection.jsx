import React, { useMemo, useState } from "react";

const INITIAL_TRANSACTIONS = [
  {
    id: 1,
    date: "2025-11-20",
    description: "Grocery Store",
    category: "Food & Dining",
    type: "expense",
    method: "Debit Card",
    amount: 85.2,
    status: "cleared",
  },
  {
    id: 2,
    date: "2025-11-19",
    description: "Salary - November",
    category: "Income",
    type: "income",
    method: "Bank Transfer",
    amount: 2500.0,
    status: "cleared",
  },
  {
    id: 3,
    date: "2025-11-18",
    description: "Coffee Shop",
    category: "Leisure",
    type: "expense",
    method: "Credit Card",
    amount: 4.5,
    status: "pending",
  },
  {
    id: 4,
    date: "2025-11-17",
    description: "Spotify Subscription",
    category: "Subscriptions",
    type: "expense",
    method: "Credit Card",
    amount: 9.99,
    status: "cleared",
  },
  {
    id: 5,
    date: "2025-11-15",
    description: "Freelance Project",
    category: "Side Hustle",
    type: "income",
    method: "PayPal",
    amount: 650.0,
    status: "cleared",
  },
];

function TransactionsSection() {
  const [transactions] = useState(INITIAL_TRANSACTIONS);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | income | expense //
  const [periodFilter, setPeriodFilter] = useState("30d"); // 30d | 7d | month | year //
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest | amountDesc | amountAsc //

  const now = useMemo(() => new Date(), []);

  const filteredSortedTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const passesPeriod = (dateStr) => {
      const txDate = new Date(dateStr + "T00:00:00");
      const diffMs = now - txDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      switch (periodFilter) {
        case "7d":
          return diffDays <= 7;
        case "30d":
          return diffDays <= 30;
        case "month": {
          return (
            txDate.getFullYear() === now.getFullYear() &&
            txDate.getMonth() === now.getMonth()
          );
        }
        case "year":
          return txDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    };

    let result = transactions.filter((tx) => {
      if (!passesPeriod(tx.date)) return false;

      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      if (normalizedSearch) {
        const haystack = (
          tx.description +
          " " +
          tx.category +
          " " +
          tx.method
        ).toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortOrder === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortOrder === "amountDesc") {
        return b.amount - a.amount;
      }
      if (sortOrder === "amountAsc") {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, periodFilter, sortOrder, now]);

  const formatAmount = (amount) =>
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
          <button className="transactions-add-btn" type="button">
            + Añadir transacción
          </button>
        </div>

        {/* Filtros */}
        <div className="transactions-filters">
          <div className="transactions-search-wrapper">
            <input
              type="text"
              className="transactions-search-input"
              placeholder="Busca por descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="transactions-filter-group">
            {/* Tipo */}
            <select
              className="transactions-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todo tipo</option>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>

            {/* Periodo */}
            <select
              className="transactions-select"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="30d">Últimos 30 días</option>
              <option value="7d">Últimos 7 días</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </select>

            {/* Orden */}
            <select
              className="transactions-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Ordenar: Más reciente</option>
              <option value="oldest">Ordenar: Más antigüo</option>
              <option value="amountDesc">Ordenar: Cantidad (Mayor → Menor)</option>
              <option value="amountAsc">Ordenar: Cantidad (Menor → Mayor)</option>
            </select>
          </div>
        </div>

        {/* Tabla de transacciones */}
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Tipo</th>
                <th>Método de pago</th>
                <th>Cantidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredSortedTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="transactions-empty">
                    No se han encontrado transacciones que coincidan con los filtros usados.
                  </td>
                </tr>
              )}

              {filteredSortedTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.description}</td>
                  <td>{tx.category}</td>
                  <td>
                    <span
                      className={`tag-pill ${
                        tx.type === "income"
                          ? "tag-pill--income"
                          : "tag-pill--expense"
                      }`}
                    >
                      {tx.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td>{tx.method}</td>
                  <td className={`amount ${tx.type === "income" ? "positive" : "negative"}`}>
                    {tx.type === "income" ? "+ " : "- "}$
                    {formatAmount(tx.amount)}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        tx.status === "cleared"
                          ? "status-pill--cleared"
                          : "status-pill--pending"
                      }`}
                    >
                      {tx.status === "cleared" ? "Cleared" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TransactionsSection;