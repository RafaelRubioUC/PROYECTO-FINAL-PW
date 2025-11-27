import React, { useMemo, useState, useEffect } from "react";

// --- ESTO ES PARA QUE NO SE ROMPAN LOS OTROS ARCHIVOS ---
export const INITIAL_TRANSACTIONS = [];
// ------------------------------------------------------------

// URL base (detecta si es local o nube)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"; // Fallback por seguridad

function TransactionsSection() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [sortOrder, setSortOrder] = useState("newest");

  // Estados para el Modal (Formulario)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0], // Fecha de hoy YYYY-MM-DD
  });

  const now = useMemo(() => new Date(), []);

  // --- 1. CARGAR DATOS DEL BACKEND ---
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

  // --- 2. GUARDAR NUEVA TRANSACCIÓN ---
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      // Validar monto negativo para gastos
      let finalAmount = parseFloat(newTx.amount);

      // Buscamos la categoría seleccionada para saber si es Gasto o Ingreso
      const selectedCat = categories.find((c) => c.id === parseInt(newTx.category_id));

      // Si es un gasto (expense) y el usuario puso el número positivo, lo volvemos negativo
      if (selectedCat && selectedCat.type === "expense" && finalAmount > 0) {
        finalAmount = finalAmount * -1;
      }

      const response = await fetch(`${API_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: newTx.description,
          amount: finalAmount,
          date: newTx.date,
          category_id: newTx.category_id,
        }),
      });

      if (response.ok) {
        alert("¡Transacción agregada!");
        setIsModalOpen(false);
        setNewTx({ description: "", amount: "", category_id: "", date: "" });
        fetchData(); // Recargar la tabla
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- LÓGICA DE FILTROS (Mantenida de tu código original) ---
  const filteredSortedTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const passesPeriod = (dateStr) => {
      const txDate = new Date(dateStr); // Ajuste: backend devuelve ISO string a veces
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
      // Enriquecemos la tx con el nombre de la categoría para poder filtrar
      const catName = categories.find((c) => c.id === tx.category_id)?.name || "Otros";
      const type = tx.amount >= 0 ? "income" : "expense"; // Deducimos tipo por el monto

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

  // Función auxiliar para obtener nombre de categoría
  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "General";
  const getCategoryType = (amount) => (amount >= 0 ? "income" : "expense");

  return (
    <section className="dashboard-row">
      <div className="panel-card full-width transactions-panel">
        <div className="transactions-header">
          <div>
            <h3 className="transactions-title">Transactions</h3>
            <p className="transactions-subtitle">Revisa y gestiona tus movimientos recientes.</p>
          </div>
          <button
            className="transactions-add-btn"
            type="button"
            onClick={() => setIsModalOpen(true)} // <--- ABRIR MODAL
          >
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
            <select className="transactions-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Todo tipo</option>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
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
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="transactions-table-wrapper">
          {loading ? (
            <p style={{ padding: "20px" }}>Cargando transacciones...</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredSortedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="transactions-empty">
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
                      <td>{getCategoryName(tx.category_id)}</td>
                      <td>
                        <span className={`tag-pill ${type === "income" ? "tag-pill--income" : "tag-pill--expense"}`}>
                          {type === "income" ? "Ingreso" : "Gasto"}
                        </span>
                      </td>
                      <td className={`amount ${type === "income" ? "positive" : "negative"}`}>
                        {type === "income" ? "+ " : ""}$ {formatAmount(tx.amount)}
                      </td>
                      <td>
                        <span className="status-pill status-pill--cleared">Completado</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ===== MODAL DE AÑADIR TRANSACCIÓN ===== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nueva Transacción</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveTransaction}>
              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Comida rápida, Salario..."
                  required
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                />
              </div>

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
                <label>Categoría</label>
                <select
                  required
                  value={newTx.category_id}
                  onChange={(e) => setNewTx({ ...newTx, category_id: e.target.value })}
                >
                  <option value="">Selecciona una...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === "income" ? "Ingreso" : "Gasto"})
                    </option>
                  ))}
                </select>
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
                <button type="submit" className="btn-save">
                  Guardar Transacción
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
