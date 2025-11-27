import React, { useMemo, useState } from "react";
import { INITIAL_TRANSACTIONS } from "./TransactionsSection";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"; // Añadimos una nueva dependencia para crear el gráfico que utilizaremos en el proyecto //

const CATEGORY_BUDGETS = {
  "Food & Dining": 600,
  Transportation: 300,
  Entertainment: 250,
};

// Tooltip custom del gráfico
const SpendingTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0].payload;
  const income = entry.income || 0;
  const expenses = entry.expenses || 0;
  const net = income - expenses;

  return (
    <div className="recap-tooltip">
      <div className="recap-tooltip-date">{label}</div>

      <div className="recap-tooltip-row">
        <span>Ingresos</span>
        <span className="recap-tooltip-income">
          +${income.toFixed(2)}
        </span>
      </div>

      <div className="recap-tooltip-row">
        <span>Gastos</span>
        <span className="recap-tooltip-expense">
          -${expenses.toFixed(2)}
        </span>
      </div>

      <div className="recap-tooltip-row recap-tooltip-net">
        <span>Balance neto</span>
        <span
          className={
            net >= 0
              ? "recap-tooltip-income"
              : "recap-tooltip-expense"
          }
        >
          {net >= 0 ? "+" : "-"}${Math.abs(net).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

function RecapSection({ onViewAllTransactions = () => {} }) {
  const [range, setRange] = useState("7d");

  // Helpers fechas
  const makeKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const makeLabel = (d) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  // === Resumen general (tarjetas de arriba) ===
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;

    INITIAL_TRANSACTIONS.forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      else expenses += tx.amount;
    });

    const balance = income - expenses;
    return { income, expenses, balance };
  }, []);

  // === Categorías principales para Monthly Budget ===
  const categories = useMemo(() => {
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
          : spent * 1.5;

      const utilization = budget > 0 ? (spent / budget) * 100 : 0;

      return {
        category,
        spent,
        budget,
        utilization,
      };
    });

    return result.slice(0, 3);
  }, []);

  // === Últimas transacciones (mini Recent Transactions) ===
  const recentTransactions = useMemo(() => {
    const copy = [...INITIAL_TRANSACTIONS];

    copy.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    return copy.slice(0, 3);
  }, []);

  // === Datos para el gráfico de Spending Overview ===
  const chartData = useMemo(() => {
    if (!INITIAL_TRANSACTIONS.length) return [];

    const parsed = INITIAL_TRANSACTIONS
      .filter((tx) => tx.date)
      .map((tx) => ({
        ...tx,
        dateObj: new Date(tx.date),
      }))
      .filter((tx) => !Number.isNaN(tx.dateObj.getTime()));

    if (!parsed.length) return [];

    // fecha más reciente
    let endDate = parsed[0].dateObj;
    parsed.forEach((tx) => {
      if (tx.dateObj > endDate) endDate = tx.dateObj;
    });

    // fecha de inicio según rango
    const startDate = new Date(endDate);
    if (range === "7d") {
      startDate.setDate(endDate.getDate() - 6);
    } else if (range === "30d") {
      startDate.setDate(endDate.getDate() - 29);
    } else if (range === "month") {
      startDate.setDate(endDate.getDate() - 29);
    } else if (range === "year") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    // crear registros día a día
    const map = new Map();
    const dayMs = 24 * 60 * 60 * 1000;

    for (
      let t = startDate.getTime();
      t <= endDate.getTime();
      t += dayMs
    ) {
      const d = new Date(t);
      const key = makeKey(d);
      map.set(key, {
        dateKey: key,
        label: makeLabel(d),
        income: 0,
        expenses: 0,
      });
    }

    // sumar ingresos/gastos por día
    parsed.forEach((tx) => {
      if (tx.dateObj < startDate || tx.dateObj > endDate) return;
      const key = makeKey(tx.dateObj);
      const entry = map.get(key);
      if (!entry) return;

      if (tx.type === "income") {
        entry.income += tx.amount;
      } else {
        entry.expenses += tx.amount;
      }
    });

    return Array.from(map.values());
  }, [range]);

  // === Helpers formato ===
  const formatMoney = (value) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatRecentDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* TOP ROW: Balance / Ingreso / Gastos */}
      <section className="dashboard-row recap-top-row">
        <div className="panel-card recap-stat-card recap-stat-card--balance">
          <div className="recap-stat-label">Balance total</div>
          <div className="recap-stat-value">
            ${formatMoney(summary.balance)}
          </div>
          <div className="recap-stat-footnote">
            Basado en todos los ingresos y gastos registrados.
          </div>
        </div>

        <div className="panel-card recap-stat-card recap-stat-card--income">
          <div className="recap-stat-label">Ingresos</div>
          <div className="recap-stat-value">
            ${formatMoney(summary.income)}
          </div>
          <div className="recap-stat-footnote">
            Dinero que has ganado.
          </div>
        </div>

        <div className="panel-card recap-stat-card recap-stat-card--expense">
          <div className="recap-stat-label">Gastos</div>
          <div className="recap-stat-value">
            ${formatMoney(summary.expenses)}
          </div>
          <div className="recap-stat-footnote">
            Dinero que has gastado.
          </div>
        </div>
      </section>

      {/* MIDDLE ROW: Monthly Budget + Recent Transactions */}
      <section className="dashboard-row recap-middle-row">
        {/* Monthly Budget */}
        <div className="panel-card recap-budget-card">
          <div className="recap-card-header">
            <h3 className="recap-card-title">Presupuesto mensual</h3>
            <span className="recap-card-subtitle">
              Vista rápida de tu gasto por categorías y sus límites.
            </span>
          </div>

          <div className="recap-budget-list">
            {categories.map((cat) => (
              <div key={cat.category} className="recap-budget-item">
                <div className="recap-budget-row">
                  <span className="recap-budget-category">
                    {cat.category}
                  </span>
                  <span className="recap-budget-amount">
                    ${formatMoney(cat.spent)} / $
                    {formatMoney(cat.budget)}
                  </span>
                </div>
                <div className="recap-budget-bar">
                  <div
                    className={`recap-budget-bar-fill ${
                      cat.utilization > 100
                        ? "recap-budget-bar-fill--danger"
                        : cat.utilization > 80
                        ? "recap-budget-bar-fill--warning"
                        : "recap-budget-bar-fill--ok"
                    }`}
                    style={{
                      width: `${Math.min(cat.utilization, 120)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="panel-card recap-recent-card">
          <div className="recap-card-header">
            <h3 className="recap-card-title">Transacciones recientes</h3>
          </div>

          <ul className="recap-recent-list">
            {recentTransactions.map((tx) => (
              <li key={tx.id} className="recap-recent-item">
                <div className="recap-recent-main">
                  <span className="recap-recent-description">
                    {tx.description}
                  </span>
                  <span
                    className={`recap-recent-amount ${
                      tx.type === "income"
                        ? "recap-recent-amount--income"
                        : "recap-recent-amount--expense"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}$
                    {formatMoney(tx.amount)}
                  </span>
                </div>
                <div className="recap-recent-meta">
                  <span className="recap-recent-category">
                    {tx.category}
                  </span>
                  <span className="recap-recent-date">
                    {formatRecentDate(tx.date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="recap-recent-button"
            onClick={onViewAllTransactions}
          >
            Ver todas las transacciones
          </button>
        </div>
      </section>

      {/* BOTTOM ROW: Spending Overview con Recharts */}
      <section className="dashboard-row recap-bottom-row">
        <div className="panel-card recap-chart-card">
          <div className="recap-chart-header">
            <div>
              <h3 className="recap-card-title">Gráfico de ingresos y gastos</h3>
              <span className="recap-card-subtitle">
                Un gráfico que muestra tus ingresos y gastos a lo largo del tiempo.
              </span>
            </div>

          <select
            className="recap-chart-range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
          </div>

          <div className="recap-chart-container">
            {!chartData.length ? (
              <div className="recap-chart-placeholder">
                No hay suficiente información para mostrar el gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="incomeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22c55e"
                        stopOpacity={0.85}
                      />
                      <stop
                        offset="100%"
                        stopColor="#22c55e"
                        stopOpacity={0.08}
                      />
                    </linearGradient>
                    <linearGradient
                      id="expensesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ef4444"
                        stopOpacity={0.85}
                      />
                      <stop
                        offset="100%"
                        stopColor="#ef4444"
                        stopOpacity={0.08}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickMargin={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<SpendingTooltip />} />
                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Ingresos"
                    stroke="#16a34a"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Gastos"
                    stroke="#ef4444"
                    fill="url(#expensesGradient)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default RecapSection;