import React, { useMemo, useState, useEffect } from "react";

// --- LÍNEA DE SEGURIDAD PARA OTROS COMPONENTES ---
export const INITIAL_TRANSACTIONS = [];
// -------------------------------------------------

// URL base (detecta si es local o nube)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function TransactionsSection() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [sortOrder, setSortOrder] = useState("newest");

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txTypeMode, setTxTypeMode] = useState("expense");

  const [newTx, setNewTx] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
  });

  const now = useMemo(() => new Date(), []);

  // --- 1. CARGAR DATOS ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      // Cargar Categorías
      const resCat = await fetch(`${API_URL}/api/categories`, { headers });
      const dataCat = await resCat.json();
      if (dataCat.success) setCategories(dataCat.data);

      // Cargar Transacciones
      const resTx = await fetch(`${API_URL}/api/transactions`, { headers });
      const dataTx = await resTx.json();
      if (dataTx.success) setTransactions(dataTx.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. GUARDAR TRANSACCIÓN ---
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let finalAmount = parseFloat(newTx.amount);
      let finalDescription = newTx.description;
      let finalCategoryId = newTx.category_id;

      if (txTypeMode === "expense") {
        if (finalAmount > 0) finalAmount = finalAmount * -1;
      } else {
        if (finalAmount < 0) finalAmount = Math.abs(finalAmount);
        if (!finalDescription.trim()) finalDescription = "Ingreso";
        finalCategoryId = null;
      }

      const response = await fetch(`${API_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: finalDescription,
          amount: finalAmount,
          date: newTx.date,
          category_id: finalCategoryId,
        }),
      });

      if (response.ok) {
        alert("¡Transacción agregada!");
        setIsModalOpen(false);
        setNewTx({ description: "", amount: "", category_id: "", date: new Date().toISOString().split("T")[0] });
        fetchData();
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- LÓGICA DE FILTROS ---
  const filteredSortedTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const passesPeriod = (dateStr) => {
      const txDate = new Date(dateStr);
      const diffMs = now - txDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      switch (periodFilter) {
        case "7d":
          return diffDays <= 7;
        case "30d":
          return diffDays <= 30;
        case "month":
          return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        case "year":
          return txDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    };

    let result = transactions.filter((tx) => {
      const catName = categories.find((c) => c.id === tx.category_id)?.name || "General";
      const type = parseFloat(tx.amount) >= 0 ? "income" : "expense";

      if (!passesPeriod(tx.date)) return false;
      if (typeFilter !== "all" && type !== typeFilter) return false;

      if (normalizedSearch) {
        const haystack = (tx.description + " " + catName).toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.date) - new Date(a.date);
      if (sortOrder === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortOrder === "amountDesc") return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortOrder === "amountAsc") return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });

    return result;
  }, [transactions, categories, searchTerm, typeFilter, periodFilter, sortOrder, now]);

  const formatAmount = (amount) =>
    Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "---";
  const getCategoryType = (amount) => (amount >= 0 ? "income" : "expense");

  return (
    <section className="dashboard-row">
      <div className="panel-card full-width transactions-panel">
        <div className="transactions-header">
          <div>
            <h3 className="transactions-title">Transactions</h3>
            <p className="transactions-subtitle">Revisa y gestiona tus movimientos recientes.</p>
          </div>
          <button className="transactions-add-btn" type="button" onClick={() => setIsModalOpen(true)}>
            + Añadir transacción
          </button>
        </div>

        <div className="transactions-filters">
          <div className="transactions-search-wrapper">
            <input
              type="text"
              className="transactions-search-input"
              placeholder="Busca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="transactions-filter-group">
            <select className="transactions-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
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
            <select className="transactions-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Más reciente</option>
              <option value="oldest">Más antiguo</option>
              <option value="amountDesc">Cantidad (Mayor a Menor)</option>
              <option value="amountAsc">Cantidad (Menor a Mayor)</option>
            </select>
          </div>
        </div>

        {/* Tabla Limpia (Sin columna Estado) */}
        <div className="transactions-table-wrapper">
          {loading ? (
            <p style={{ padding: "20px" }}>Cargando...</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  {/* Columna Estado ELIMINADA */}
                </tr>
              </thead>
              <tbody>
                {filteredSortedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="transactions-empty">
                      No hay transacciones registradas.
                    </td>
                  </tr>
                )}
                {filteredSortedTransactions.map((tx) => {
                  const type = getCategoryType(tx.amount);
                  return (
                    <tr key={tx.id}>
                      <td>{new Date(tx.date).toLocaleDateString()}</td>
                      <td>{tx.description}</td>
                      <td>{tx.category_id ? getCategoryName(tx.category_id) : "Ingreso"}</td>
                      <td>
                        <span className={`tag-pill ${type === "income" ? "tag-pill--income" : "tag-pill--expense"}`}>
                          {type === "income" ? "Ingreso" : "Gasto"}
                        </span>
                      </td>
                      <td className={`amount ${type === "income" ? "positive" : "negative"}`}>
                        {type === "income" ? "+ " : ""}$ {formatAmount(tx.amount)}
                      </td>
                      {/* Celda Estado ELIMINADA */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nueva Transacción</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => setTxTypeMode("expense")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: txTypeMode === "expense" ? "#ef4444" : "#f1f5f9",
                  color: txTypeMode === "expense" ? "white" : "#64748b",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                GASTO 📉
              </button>
              <button
                type="button"
                onClick={() => setTxTypeMode("income")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: txTypeMode === "income" ? "#10b981" : "#f1f5f9",
                  color: txTypeMode === "income" ? "white" : "#64748b",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                INGRESO 📈
              </button>
            </div>

            <form onSubmit={handleSaveTransaction}>
              {txTypeMode === "expense" && (
                <>
                  <div className="form-group">
                    <label>Descripción</label>
                    <input
                      type="text"
                      placeholder="Ej: Comida rápida..."
                      required
                      value={newTx.description}
                      onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      required
                      value={newTx.category_id}
                      onChange={(e) => setNewTx({ ...newTx, category_id: e.target.value })}
                    >
                      <option value="">Selecciona una...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  required
                  value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  style={{ background: txTypeMode === "income" ? "#10b981" : "#ef4444" }}
                >
                  {txTypeMode === "income" ? "Guardar Ingreso" : "Guardar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default TransactionsSection;
