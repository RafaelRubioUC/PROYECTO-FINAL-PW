import React, { useState, useEffect, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function BudgetSection() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(""); // ID de la categoría seleccionada
  const [loading, setLoading] = useState(true);

  // --- 1. CARGAR DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [resCat, resTx] = await Promise.all([
          fetch(`${API_URL}/api/categories`, { headers }),
          fetch(`${API_URL}/api/transactions`, { headers }),
        ]);

        const dataCat = await resCat.json();
        const dataTx = await resTx.json();

        if (dataCat.success) setCategories(dataCat.data);
        if (dataTx.success) setTransactions(dataTx.data);
      } catch (error) {
        console.error("Error cargando budget:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. CÁLCULOS MATEMÁTICOS ---
  const budgetData = useMemo(() => {
    // A. Calcular INGRESO TOTAL (La base del 100%)
    const totalIncome = transactions
      .filter((tx) => parseFloat(tx.amount) > 0)
      .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

    // B. Calcular GASTO de la categoría seleccionada
    let selectedCategoryName = "Selecciona una categoría";
    let selectedCategoryColor = "#cbd5e1";
    let categoryExpense = 0;

    if (selectedCatId) {
      const category = categories.find((c) => c.id === parseInt(selectedCatId));
      if (category) {
        selectedCategoryName = category.name;
        selectedCategoryColor = category.color;

        // Sumar solo gastos (negativos) de esa categoría
        categoryExpense = transactions
          .filter((tx) => tx.category_id === parseInt(selectedCatId) && parseFloat(tx.amount) < 0)
          .reduce((acc, tx) => acc + Math.abs(parseFloat(tx.amount)), 0);
      }
    }

    // C. Calcular Porcentaje
    // Si no hay ingresos, evitamos división por cero
    const percentage = totalIncome > 0 ? (categoryExpense / totalIncome) * 100 : 0;

    return {
      totalIncome,
      categoryName: selectedCategoryName,
      categoryColor: selectedCategoryColor,
      categoryExpense,
      percentage: percentage.toFixed(1), // Solo 1 decimal (ej: 25.5%)
    };
  }, [transactions, categories, selectedCatId]);

  const formatMoney = (amount) => Number(amount).toLocaleString("en-US", { style: "currency", currency: "USD" });

  if (loading) return <div style={{ padding: "20px" }}>Cargando presupuesto...</div>;

  return (
    <section className="dashboard-row">
      <div className="panel-card full-width">
        <div className="panel-header">
          <div>
            <p className="dashboard-subtitle">Analiza cuánto de tus ingresos totales consume cada categoría.</p>
          </div>
        </div>

        <div className="budget-container" style={{ padding: "10px 0" }}>
          {/* 1. TARJETA DE INGRESO TOTAL */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "30px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#166534", fontWeight: "600", marginBottom: "5px" }}>INGRESO TOTAL REGISTRADO</p>
            <h1 style={{ color: "#15803d", fontSize: "2.5rem", margin: 0 }}>{formatMoney(budgetData.totalIncome)}</h1>
          </div>

          {/* 2. SELECTOR DE CATEGORÍA */}
          <div className="form-group" style={{ maxWidth: "400px", margin: "0 auto 30px auto" }}>
            <label style={{ textAlign: "center", display: "block", marginBottom: "10px" }}>
              ¿Qué categoría quieres analizar?
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "1rem",
              }}
            >
              <option value="">-- Elige una categoría --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. VISUALIZACIÓN DE BARRAS (Solo si seleccionó algo) */}
          {selectedCatId && (
            <div className="budget-visualization" style={{ animation: "fadeIn 0.5s ease" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: "#64748b" }}>Gastado en {budgetData.categoryName}</h4>
                  <h2 style={{ margin: 0, color: "#1e293b" }}>{formatMoney(budgetData.categoryExpense)}</h2>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h2 style={{ margin: 0, color: budgetData.categoryColor }}>{budgetData.percentage}%</h2>
                  <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>de tus ingresos</span>
                </div>
              </div>

              {/* LA BARRITA (PROGRESS BAR) */}
              <div
                style={{
                  height: "24px",
                  width: "100%",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Barra de progreso animada */}
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(budgetData.percentage, 100)}%`, // Tope visual en 100%
                    backgroundColor: budgetData.categoryColor,
                    transition: "width 1s ease-in-out",
                    borderRadius: "12px",
                  }}
                />
              </div>

              {/* Mensaje de contexto */}
              <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "#64748b", textAlign: "center" }}>
                Has utilizado el <b>{budgetData.percentage}%</b> de todo el dinero que ingresaste en{" "}
                <b>{budgetData.categoryName}</b>.
                {parseFloat(budgetData.percentage) > 50 && (
                  <span style={{ display: "block", color: "#ef4444", fontWeight: "bold", marginTop: "5px" }}>
                    ¡Cuidado! Esta categoría consume más de la mitad de tus ingresos.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Mensaje si no selecciona nada */}
          {!selectedCatId && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
              Selecciona una categoría arriba para ver el impacto en tu presupuesto.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BudgetSection;
