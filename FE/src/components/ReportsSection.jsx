import React, { useMemo } from "react";
import { INITIAL_TRANSACTIONS } from "./TransactionsSection";

function ReportsSection() {
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;

    INITIAL_TRANSACTIONS.forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      else expenses += tx.amount;
    });

    const balance = income - expenses;
    const savingsRate =
      income > 0 ? ((income - expenses) / income) * 100 : 0;

    return { income, expenses, balance, savingsRate };
  }, []);

  const expenseByCategory = useMemo(() => {
    const map = new Map();

    INITIAL_TRANSACTIONS.forEach((tx) => {
      if (tx.type !== "expense") return;
      const prev = map.get(tx.category) || 0;
      map.set(tx.category, prev + tx.amount);
    });

    const totalExpenses = Array.from(map.values()).reduce(
      (sum, v) => sum + v,
      0
    );

    return Array.from(map.entries()).map(([category, amount]) => ({
      category,
      amount,
      share:
        totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }));
  }, []);

  const formatMoney = (value) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section className="dashboard-row">
      <div className="panel-card full-width reports-panel">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h3 className="reports-title">Reports</h3>
            <p className="reports-subtitle">
              Una vista rápida de tu flujo de dinero e indicadores clave.
            </p>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="reports-metrics-grid">
          <div className="reports-metric-card reports-metric-card--income">
            <span className="reports-metric-label">Ingresos totales</span>
            <span className="reports-metric-value">
              ${formatMoney(summary.income)}
            </span>
          </div>

          <div className="reports-metric-card reports-metric-card--expense">
            <span className="reports-metric-label">Gastos totales</span>
            <span className="reports-metric-value">
              ${formatMoney(summary.expenses)}
            </span>
          </div>

          <div className="reports-metric-card reports-metric-card--balance">
            <span className="reports-metric-label">Balance neto</span>
            <span className="reports-metric-value">
              ${formatMoney(summary.balance)}
            </span>
          </div>

          <div className="reports-metric-card reports-metric-card--savings">
            <span className="reports-metric-label">Tasa de ahorro</span>
            <span className="reports-metric-value">
              {summary.savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Dos columnas: distribución de gastos + insights */}
        <div className="reports-body">
          <div className="reports-block">
            <h4 className="reports-block-title">
              Distribución de gastos por categoría
            </h4>
            {expenseByCategory.length === 0 ? (
              <p className="reports-empty">
                No se encontraron categorías de gastos en sus transacciones.
              </p>
            ) : (
              <ul className="reports-category-list">
                {expenseByCategory.map((cat) => (
                  <li key={cat.category} className="reports-category-item">
                    <div className="reports-category-header">
                      <span className="reports-category-name">
                        {cat.category}
                      </span>
                      <span className="reports-category-amount">
                        ${formatMoney(cat.amount)} ({cat.share.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="reports-category-bar">
                      <div
                        className="reports-category-bar-fill"
                        style={{ width: `${cat.share}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="reports-block">
            <h4 className="reports-block-title">Quick insights</h4>
            <ul className="reports-insights-list">
              <li>
                Tus gastos representan{" "}
                <strong>
                  {summary.income > 0
                    ? ((summary.expenses / summary.income) * 100).toFixed(1)
                    : "0"}
                  %
                </strong>{" "}
                de tus ingresos totales.
              </li>
              <li>
                Su saldo neto actual es{" "}
                <strong>
                  {summary.balance >= 0 ? "positivo" : "negativo"}
                </strong>{" "}
                (${formatMoney(summary.balance)}).
              </li>
              {expenseByCategory[0] && (
                <li>
                  Su categoría de gasto principal es{" "}
                  <strong>{expenseByCategory[0].category}</strong> con{" "}
                  <strong>
                    ${formatMoney(expenseByCategory[0].amount)}
                  </strong>{" "}
                  gastados.
                </li>
              )}
              {expenseByCategory.length > 1 && (
                <li>
                  Tus gastos se distribuyen en{" "}
                  <strong>{expenseByCategory.length}</strong> categorías
                   fijas. Prestar atención a tus 2 o 3 categorías principales
                   suele tener el mayor impacto en tu presupuesto.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReportsSection;