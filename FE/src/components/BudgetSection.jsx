import React, { useMemo } from "react";
import { INITIAL_TRANSACTIONS } from "./TransactionsSection";

const CATEGORY_BUDGETS = {
  "Food & Dining": 300,
  Leisure: 150,
  Subscriptions: 50,
};

function BudgetSection() {
  const expenseByCategory = useMemo(() => {
    const map = new Map();

    INITIAL_TRANSACTIONS.forEach((tx) => {
      if (tx.type !== "expense") return;
      const prev = map.get(tx.category) || 0;
      map.set(tx.category, prev + tx.amount);
    });

    const result = Array.from(map.entries()).map(([category, spent]) => {
      const budget =
        CATEGORY_BUDGETS[category] !== undefined
          ? CATEGORY_BUDGETS[category]
          : spent * 1.5; // Si no se asigna un presupuesto definido este es un falback sencillo //

      const remaining = budget - spent;
      const utilization = budget > 0 ? (spent / budget) * 100 : 0;

      let status = "Dentro del límite";
      if (utilization > 100) status = "Fuera del límite";
      else if (utilization > 80) status = "Cerca del límite";

      return {
        category,
        budget,
        spent,
        remaining,
        utilization,
        status,
      };
    });

    // Ordenamos por gasto más alto //
    result.sort((a, b) => b.spent - a.spent);

    return result;
  }, []);

  const totals = useMemo(() => {
    const totalBudget = expenseByCategory.reduce(
      (sum, c) => sum + c.budget,
      0
    );
    const totalSpent = expenseByCategory.reduce(
      (sum, c) => sum + c.spent,
      0
    );
    const avgUtilization =
      expenseByCategory.length > 0
        ? expenseByCategory.reduce(
            (sum, c) => sum + c.utilization,
            0
          ) / expenseByCategory.length
        : 0;

    return { totalBudget, totalSpent, avgUtilization };
  }, [expenseByCategory]);

  const formatMoney = (value) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section className="dashboard-row">
      <div className="panel-card full-width budget-panel">
        {/* Header */}
        <div className="budget-header">
          <div>
            <h3 className="budget-title">Budget</h3>
            <p className="budget-subtitle">
              Revisa cuánto has gastado por categoría y qué tan cerca estás de
              tus límites.
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="budget-summary-row">
          <div className="budget-summary-card">
            <span className="budget-summary-label">Presupuesto total</span>
            <span className="budget-summary-value">
              ${formatMoney(totals.totalBudget)}
            </span>
          </div>

          <div className="budget-summary-card">
            <span className="budget-summary-label">Total gastado</span>
            <span className="budget-summary-value">
              ${formatMoney(totals.totalSpent)}
            </span>
          </div>

          <div className="budget-summary-card">
            <span className="budget-summary-label">Promedio del porcentaje de la cantidad usada</span>
            <span className="budget-summary-value">
              {totals.avgUtilization.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Tabla de categorías */}
        <div className="budget-table-wrapper">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Presupuesto</th>
                <th>Gastado</th>
                <th>Restante</th>
                <th>Cantidad usada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {expenseByCategory.length === 0 && (
                <tr>
                  <td colSpan={6} className="budget-empty">
                    No se encontraron categorías de gastos en tus transacciones.
                  </td>
                </tr>
              )}

              {expenseByCategory.map((cat) => (
                <tr key={cat.category}>
                  <td>{cat.category}</td>
                  <td>${formatMoney(cat.budget)}</td>
                  <td>${formatMoney(cat.spent)}</td>
                  <td
                    className={
                      cat.remaining < 0 ? "budget-negative" : undefined
                    }
                  >
                    {cat.remaining < 0 ? "-" : ""}
                    ${formatMoney(Math.abs(cat.remaining))}
                  </td>
                  <td>
                    <div className="budget-progress-wrapper">
                      <div className="budget-progress-bar">
                        <div
                          className={`budget-progress-fill ${
                            cat.utilization > 100
                              ? "budget-progress-fill--over"
                              : cat.utilization > 80
                              ? "budget-progress-fill--warning"
                              : "budget-progress-fill--ok"
                          }`}
                          style={{
                            width: `${Math.min(cat.utilization, 120)}%`,
                          }}
                        />
                      </div>
                      <span className="budget-progress-label">
                        {cat.utilization.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`budget-status-pill ${
                        cat.status === "Over budget"
                          ? "budget-status-pill--danger"
                          : cat.status === "Close to limit"
                          ? "budget-status-pill--warning"
                          : "budget-status-pill--ok"
                      }`}
                    >
                      {cat.status}
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

export default BudgetSection;