import React, { useMemo, useState, useEffect, useRef } from "react";
// Importamos iconos nuevos para el menú
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

export const INITIAL_TRANSACTIONS = [];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function TransactionsSection() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTROS DE FECHA ---
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

  const [filterStartDate, setFilterStartDate] = useState(firstDay);
  const [filterEndDate, setFilterEndDate] = useState(lastDay);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // --- ESTADOS DE UI (MODAL Y MENÚ) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txTypeMode, setTxTypeMode] = useState("expense");

  // Para Editar
  const [editingId, setEditingId] = useState(null); // Si es null, estamos CREANDO. Si tiene ID, estamos EDITANDO.

  // Para el menú de 3 puntos
  const [openMenuId, setOpenMenuId] = useState(null); // ID de la transacción con menú abierto

  const [newTx, setNewTx] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Cerrar menú si clic afuera
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    if (openMenuId) window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const resCat = await fetch(`${API_URL}/api/categories`, { headers });
      const dataCat = await resCat.json();
      if (dataCat.success) setCategories(dataCat.data);

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

  // --- ACCIÓN: ABRIR MODAL PARA CREAR ---
  const openCreateModal = () => {
    setEditingId(null); // Modo crear
    setNewTx({
      description: "",
      amount: "",
      category_id: "",
      date: new Date().toISOString().split("T")[0],
    });
    setTxTypeMode("expense"); // Resetear a gasto por defecto
    setIsModalOpen(true);
  };

  // --- ACCIÓN: ABRIR MODAL PARA EDITAR ---
  const handleEditClick = (e, tx) => {
    e.stopPropagation(); // Evita cerrar el menú inmediatamente
    setEditingId(tx.id); // Modo editar con este ID

    // Detectar si es ingreso o gasto basado en el monto
    const amountVal = parseFloat(tx.amount);
    const isIncome = amountVal >= 0;

    setTxTypeMode(isIncome ? "income" : "expense");

    // Pre-llenar el formulario
    setNewTx({
      description: tx.description,
      amount: Math.abs(amountVal), // Mostramos siempre positivo en el input
      category_id: tx.category_id || "", // Si es null (ingreso), string vacío
      // Ajuste de fecha para que el input type="date" la lea bien
      date: tx.date.split("T")[0],
    });

    setIsModalOpen(true);
    setOpenMenuId(null); // Cerrar menú
  };

  // --- ACCIÓN: ELIMINAR ---
  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de eliminar esta transacción?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Eliminado correctamente");
        fetchData();
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error(error);
    }
    setOpenMenuId(null);
  };

  // --- GUARDAR (CREAR O ACTUALIZAR) ---
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

      // DECIDIR SI ES POST (CREAR) O PUT (ACTUALIZAR)
      const url = editingId
        ? `${API_URL}/api/transactions/${editingId}` // PUT
        : `${API_URL}/api/transactions`; // POST

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
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
        alert(editingId ? "Actualizado correctamente" : "Creado correctamente");
        setIsModalOpen(false);
        fetchData();
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- FILTROS (Igual que antes) ---
  const filteredSortedTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const getIsoDatePart = (dateStr) => (dateStr ? dateStr.split("T")[0] : "");

    let result = transactions.filter((tx) => {
      const txDateStr = getIsoDatePart(tx.date);
      if (filterStartDate && txDateStr < filterStartDate) return false;
      if (filterEndDate && txDateStr > filterEndDate) return false;

      if (typeFilter !== "all") {
        const type = parseFloat(tx.amount) >= 0 ? "income" : "expense";
        if (type !== typeFilter) return false;
      }

      const catName = categories.find((c) => c.id === tx.category_id)?.name || "General";
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
  }, [transactions, categories, searchTerm, typeFilter, filterStartDate, filterEndDate, sortOrder]);

  const formatAmount = (amount) =>
    Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "---";
  const getCategoryType = (amount) => (amount >= 0 ? "income" : "expense");
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "---";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) return dateStr.split("T")[0];
    return dateObj.toLocaleDateString("es-ES", { timeZone: "UTC" });
  };

  return (
    <section className="dashboard-row">
      <div className="panel-card full-width transactions-panel">
        <div className="transactions-header">
          <div>
            <h3 className="transactions-title">Transactions</h3>
            <p className="transactions-subtitle">Revisa y gestiona tus movimientos.</p>
          </div>
          {/* USAR FUNCIÓN openCreateModal */}
          <button className="transactions-add-btn" type="button" onClick={openCreateModal}>
            + Añadir transacción
          </button>
        </div>

        {/* FILTROS (Igual que antes) */}
        <div className="transactions-filters">
          <div className="transactions-search-wrapper">
            <input
              type="text"
              className="transactions-search-input"
              placeholder="Buscar transacción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="transactions-filter-group">
            {/* Tipo: todos / ingreso / gasto */}
            <select
              className="transactions-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tipo: Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>

            {/* Fecha DESDE */}
            <div className="transactions-date-filter">
              <span className="transactions-date-label">Desde:</span>
              <input
                type="date"
                className="transactions-date-input"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            {/* Fecha HASTA */}
            <div className="transactions-date-filter">
              <span className="transactions-date-label">Hasta:</span>
              <input
                type="date"
                className="transactions-date-input"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>

            {/* Ordenamiento */}
            <select
              className="transactions-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Más reciente</option>
              <option value="oldest">Más antiguo</option>
              <option value="amountDesc">Mayor cantidad</option>
              <option value="amountAsc">Menor cantidad</option>
            </select>
          </div>
        </div>

        <div className="transactions-table-wrapper">
          {loading ? (
            <p className="transactions-loading">Cargando transacciones...</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th className="transactions-actions-header"></th> {/* Columna Acciones */}
                </tr>
              </thead>
              <tbody>
                {filteredSortedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="transactions-empty">
                      No se encontraron transacciones.
                    </td>
                  </tr>
                )}
                {filteredSortedTransactions.map((tx) => {
                  const type = getCategoryType(tx.amount);
                  return (
                    <tr key={tx.id}>
                      <td>{formatDateDisplay(tx.date)}</td>
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

                      {/* CELDA DE ACCIONES (3 PUNTOS) */}
                      <td className="action-cell">
                        <button
                          className="btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Si ya está abierto este, lo cierra. Si no, lo abre.
                            setOpenMenuId(openMenuId === tx.id ? null : tx.id);
                          }}
                        >
                          <FiMoreVertical />
                        </button>

                        {/* MENÚ FLOTANTE */}
                        {openMenuId === tx.id && (
                          <div className="action-menu">
                            <button onClick={(e) => handleEditClick(e, tx)}>
                              <FiEdit2 /> Editar
                            </button>
                            <button className="delete-btn" onClick={(e) => handleDeleteClick(e, tx.id)}>
                              <FiTrash2 /> Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL (Ahora dinámico para Crear/Editar) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? "Editar Transacción" : "Nueva Transacción"}</h2>
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
                  {editingId ? "Actualizar" : txTypeMode === "income" ? "Guardar Ingreso" : "Guardar Gasto"}
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