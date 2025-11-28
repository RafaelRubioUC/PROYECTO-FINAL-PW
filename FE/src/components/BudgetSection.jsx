import React, { useState, useEffect, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** Mes actual en formato YYYY-MM, para guardar presupuesto por mes */
function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Devuelve true si la fecha pertenece al mes y año actuales */
function isFromCurrentMonth(rawDate) {
  if (!rawDate) return false;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth()
  );
}

/** Obtiene el id de categoría desde las posibles propiedades */
function getCategoryId(tx) {
  return (
    tx.category_id ??
    tx.categoryId ??
    tx.category?.id ??
    tx.category?.category_id ??
    null
  );
}

/** Devuelve el nombre legible de la categoría */
function getCategoryName(cat) {
  return cat.name || cat.category_name || cat.nombre || "Sin nombre";
}

function BudgetSection() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthKey = getCurrentMonthKey();

  // Presupuesto total aplicado (el que realmente se usa en cálculos)
  const [totalBudget, setTotalBudget] = useState(0);
  // Borrador que el usuario escribe en el input
  const [totalBudgetDraft, setTotalBudgetDraft] = useState("");

  // Presupuestos por categoría CONFIRMADOS: { [categoryId]: number }
  const [categoryBudgets, setCategoryBudgets] = useState({});
  // Borradores por categoría (lo que el usuario va escribiendo): { [categoryId]: string }
  const [categoryBudgetsDraft, setCategoryBudgetsDraft] = useState({});

  // ===========================
  // 1) Cargar transacciones + categorías del backend
  // ===========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("spendlist_token") ||
          localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [resCat, resTx] = await Promise.all([
          fetch(`${API_URL}/api/categories`, { headers }),
          fetch(`${API_URL}/api/transactions`, { headers }),
        ]);

        const dataCat = await resCat.json();
        const dataTx = await resTx.json();

        if (dataCat.success && Array.isArray(dataCat.data)) {
          setCategories(dataCat.data);
        } else {
          setCategories([]);
        }

        if (dataTx.success && Array.isArray(dataTx.data)) {
          setTransactions(dataTx.data);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error cargando budget:", error);
        setCategories([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===========================
  // 2) Cargar presupuesto desde localStorage (por mes)
  // ===========================
  useEffect(() => {
    try {
      const storedTotal = localStorage.getItem(
        `spendlist_totalBudget_${monthKey}`
      );
      const storedCats = localStorage.getItem(
        `spendlist_categoryBudgets_${monthKey}`
      );

      if (storedTotal != null) {
        const num = Number(storedTotal);
        if (!Number.isNaN(num)) {
          setTotalBudget(num);
          setTotalBudgetDraft(String(num)); // sincronizar borrador con valor aplicado
        }
      }

      if (storedCats != null) {
        const parsed = JSON.parse(storedCats);
        if (parsed && typeof parsed === "object") {
          setCategoryBudgets(parsed);

          // El borrador empieza igual que los valores guardados
          const draftObj = {};
          Object.entries(parsed).forEach(([catId, val]) => {
            draftObj[catId] = String(val);
          });
          setCategoryBudgetsDraft(draftObj);
        }
      }
    } catch (error) {
      console.error("Error leyendo presupuesto desde localStorage:", error);
    }
  }, [monthKey]);

  // ===========================
  // 3) Guardar presupuesto en localStorage cuando cambie
  // ===========================
  useEffect(() => {
    try {
      localStorage.setItem(
        `spendlist_totalBudget_${monthKey}`,
        String(totalBudget || 0)
      );
      localStorage.setItem(
        `spendlist_categoryBudgets_${monthKey}`,
        JSON.stringify(categoryBudgets || {})
      );
    } catch (error) {
      console.error("Error guardando presupuesto en localStorage:", error);
    }
  }, [monthKey, totalBudget, categoryBudgets]);

  // ===========================
  // 4) Calcular gastos del MES ACTUAL por categoría
  // ===========================
  const monthlyExpensesByCategory = useMemo(() => {
    const result = {};

    if (!Array.isArray(transactions)) return result;

    transactions.forEach((tx) => {
      // Usamos la MISMA lógica que ya usan en otros lados:
      // amount < 0 => gasto
      const rawAmount = tx.amount ?? tx.monto ?? 0;
      const amountNum = Number(rawAmount);
      if (Number.isNaN(amountNum) || amountNum >= 0) return; // no es gasto

      const rawDate =
        tx.date || tx.transaction_date || tx.fecha || tx.created_at;
      if (!isFromCurrentMonth(rawDate)) return;

      const catId = getCategoryId(tx);
      if (!catId) return;

      const expense = Math.abs(amountNum);
      if (!result[catId]) result[catId] = 0;
      result[catId] += expense;
    });

    return result;
  }, [transactions]);

  const totalMonthExpenses = useMemo(
    () =>
      Object.values(monthlyExpensesByCategory).reduce(
        (sum, v) => sum + (Number(v) || 0),
        0
      ),
    [monthlyExpensesByCategory]
  );

  const totalAssignedBudget = useMemo(
    () =>
      Object.values(categoryBudgets).reduce(
        (sum, v) => sum + (Number(v) || 0),
        0
      ),
    [categoryBudgets]
  );

  const remainingBudget = totalBudget - totalAssignedBudget;
  const usedPercentage =
    totalBudget > 0
      ? Math.min((totalMonthExpenses / totalBudget) * 100, 999)
      : 0;

  // ===========================
  // 5) Handlers
  // ===========================

  // Input del presupuesto total → solo modifica el borrador
  const handleTotalBudgetDraftChange = (e) => {
    setTotalBudgetDraft(e.target.value);
  };

  // Botón Confirmar / Actualizar presupuesto total
  const handleConfirmTotalBudget = () => {
    const num = parseFloat(totalBudgetDraft);
    if (Number.isNaN(num) || num < 0) {
      setTotalBudget(0);
      setTotalBudgetDraft("");
      return;
    }
    setTotalBudget(num);
  };

  // Input de cada categoría → solo borrador
  const handleCategoryBudgetDraftChange = (categoryId, value) => {
    setCategoryBudgetsDraft((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  // Botón Confirmar / Actualizar presupuesto de una categoría
  const handleConfirmCategoryBudget = (categoryId) => {
    const raw = categoryBudgetsDraft[categoryId];
    const num = parseFloat(raw);

    const safeValue =
      !Number.isNaN(num) && num >= 0 ? num : 0;

    setCategoryBudgets((prev) => ({
      ...prev,
      [categoryId]: safeValue,
    }));

    setCategoryBudgetsDraft((prev) => ({
      ...prev,
      [categoryId]: safeValue ? String(safeValue) : "",
    }));
  };

  if (loading) {
    return (
      <section className="budget-section">
        <div className="panel-card">
          <p>Cargando presupuesto...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="budget-section">
      {/* Encabezado de la sección */}
      <header className="budget-header">
        <div>
          <h2 className="budget-title">Budget planner</h2>
          <p className="budget-subtitle">
            Define un presupuesto mensual y reparte ese monto entre tus
            categorías de gasto. A medida que registras transacciones, verás
            qué tanto te acercas a tus límites.
          </p>
        </div>
      </header>

      {/* Fila superior: resumen general */}
      <div className="budget-grid">
        {/* Tarjeta: presupuesto mensual */}
        <div className="budget-summary-card">
          <h3 className="budget-summary-title">Presupuesto mensual</h3>

          <div className="budget-total-row">
            <label className="budget-total-label">
              Monto total para este mes
            </label>

            <div className="budget-total-row-right">
              <div className="budget-total-input-wrapper">
                <span className="budget-total-prefix">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalBudgetDraft}
                  onChange={handleTotalBudgetDraftChange}
                  className="budget-total-input"
                  placeholder="0.00"
                />
              </div>
              <button
                type="button"
                className="budget-total-confirm-btn"
                onClick={handleConfirmTotalBudget}
              >
                {totalBudget > 0 ? "Actualizar" : "Confirmar"}
              </button>
            </div>
          </div>

          <div className="budget-summary-info">
            <p>
              Asignado en categorías:{" "}
              <strong>${totalAssignedBudget.toFixed(2)}</strong>
            </p>
            <p
              className={
                remainingBudget >= 0
                  ? "budget-unassigned"
                  : "budget-unassigned budget-unassigned--negative"
              }
            >
              {remainingBudget >= 0
                ? "Presupuesto sin asignar: "
                : "Exceso asignado: "}
              <strong>${Math.abs(remainingBudget).toFixed(2)}</strong>
            </p>
          </div>
        </div>

        {/* Tarjeta: estado del mes */}
        <div className="budget-summary-card budget-summary-card--stats">
          <h3 className="budget-summary-title">Estado del mes</h3>

          <div className="budget-stats-row">
            <div className="budget-stat-box">
              <span className="budget-stat-label">Gasto del mes</span>
              <span className="budget-stat-value">
                ${totalMonthExpenses.toFixed(2)}
              </span>
            </div>
            <div className="budget-stat-box">
              <span className="budget-stat-label">Presupuesto usado</span>
              <span className="budget-stat-value">
                {usedPercentage.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="budget-summary-progress-track">
            <div
              className={`budget-summary-progress-bar ${
                usedPercentage < 80
                  ? "is-safe"
                  : usedPercentage < 100
                  ? "is-warning"
                  : "is-over"
              }`}
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            />
          </div>

          <p className="budget-summary-caption">
            Solo se consideran los gastos del mes actual.
          </p>
        </div>
      </div>

      {/* Tarjeta inferior: presupuestos por categoría */}
      <div className="budget-categories-card">
        <div className="budget-categories-header">
          <div>
            <h3 className="budget-categories-title">
              Presupuestos por categoría
            </h3>
            <p className="budget-categories-subtitle">
              Asigna parte de tu presupuesto total a cada categoría. Las barras
              se irán llenando con los gastos del mes actual.
            </p>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="budget-empty-text">
            Aún no tienes categorías configuradas. Crea categorías desde el
            módulo de transacciones.
          </p>
        ) : (
          <div className="budget-category-list">
            {categories.map((cat) => {
              const catId = cat.id ?? cat.category_id;
              const catName = getCategoryName(cat);

              const budget = Number(categoryBudgets[catId] || 0);
              const spent = Number(monthlyExpensesByCategory[catId] || 0);

              let pct = 0;
              if (budget > 0) {
                pct = (spent / budget) * 100;
              }

              let progressClass = "is-safe";
              if (budget > 0) {
                if (pct >= 100) progressClass = "is-over";
                else if (pct >= 80) progressClass = "is-warning";
              }

              // Valor que muestra el input (borrador).
              const draftValue =
                categoryBudgetsDraft[catId] !== undefined
                  ? categoryBudgetsDraft[catId]
                  : budget
                  ? String(budget)
                  : "";

              return (
                <div key={catId} className="budget-category-row">
                  <div className="budget-category-top">
                    <div className="budget-category-info">
                      <span className="budget-category-name">
                        {catName}
                      </span>
                      {budget > 0 ? (
                        <span className="budget-category-amount">
                          ${spent.toFixed(2)} de ${budget.toFixed(2)}
                        </span>
                      ) : (
                        <span className="budget-category-amount budget-category-amount--no-budget">
                          Sin presupuesto asignado
                        </span>
                      )}
                    </div>

                    <div className="budget-category-input-wrapper">
                      <label className="budget-category-input-label">
                        Presupuesto
                      </label>
                      <div className="budget-category-input-row">
                        <div className="budget-category-input-inner">
                          <span className="budget-total-prefix">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draftValue}
                            onChange={(e) =>
                              handleCategoryBudgetDraftChange(
                                catId,
                                e.target.value
                              )
                            }
                            className="budget-category-input"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          type="button"
                          className="budget-category-confirm-btn"
                          onClick={() =>
                            handleConfirmCategoryBudget(catId)
                          }
                        >
                          {budget > 0 ? "Actualizar" : "Confirmar"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {budget > 0 && (
                    <>
                      <div className="budget-progress-track">
                        <div
                          className={`budget-progress-bar ${progressClass}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="budget-category-footer">
                        <span className="budget-percentage">
                          {Math.min(pct, 999).toFixed(0)}% usado
                        </span>
                        {spent > budget && (
                          <span className="budget-over-amount">
                            Te has pasado en ${(
                              spent - budget
                            ).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default BudgetSection;