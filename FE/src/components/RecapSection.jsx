// FE/src/components/RecapSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function RecapSection({ onViewAllTransactions }) {
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0–11
  const monthLabel = now.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("spendlist_token") ||
          localStorage.getItem("token");

        if (!token) {
          setAllTransactions([]);
          setRecentTransactions([]);
          setSummary({ balance: 0, income: 0, expenses: 0 });
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const response = await fetch(`${API_URL}/api/transactions`, {
          headers,
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const allTx = data.data;

          // === SOLO TRANSACCIONES DEL MES ACTUAL ===
          const monthTx = allTx.filter((tx) => {
            if (!tx.date) return false;
            const txDate = new Date(tx.date);
            if (Number.isNaN(txDate.getTime())) return false;
            return (
              txDate.getFullYear() === currentYear &&
              txDate.getMonth() === currentMonth
            );
          });

          // Más recientes primero
          monthTx.sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return db - da;
          });

          setAllTransactions(monthTx);

          // Totales del mes
          let income = 0;
          let expenses = 0;

          monthTx.forEach((tx) => {
            const amount = parseFloat(tx.amount);
            if (Number.isNaN(amount)) return;

            if (amount >= 0) {
              income += amount;
            } else {
              expenses += Math.abs(amount); // gastos siempre positivos
            }
          });

          setSummary({
            balance: income - expenses,
            income,
            expenses,
          });

          // Últimas 6 transacciones del mes //
          setRecentTransactions(monthTx.slice(0, 6));
        } else {
          setAllTransactions([]);
          setRecentTransactions([]);
          setSummary({ balance: 0, income: 0, expenses: 0 });
        }
      } catch (error) {
        console.error("Error cargando datos en RecapSection:", error);
        setAllTransactions([]);
        setRecentTransactions([]);
        setSummary({ balance: 0, income: 0, expenses: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentYear]);

  // === DATOS PARA EL GRÁFICO DEL MES ACTUAL ===
  const areaData = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDate();

    const data = [];

    for (let day = 1; day <= todayDay; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateStr = d.toISOString().split("T")[0]; // yyyy-mm-dd

      const dayTxs = allTransactions.filter((tx) => {
        if (!tx.date) return false;
        const txDatePart = String(tx.date).split("T")[0];
        return txDatePart === dateStr;
      });

      const income = dayTxs.reduce((acc, tx) => {
        const amount = parseFloat(tx.amount);
        if (Number.isNaN(amount)) return acc;
        return amount > 0 ? acc + amount : acc;
      }, 0);

      const expense = dayTxs.reduce((acc, tx) => {
        const amount = parseFloat(tx.amount);
        if (Number.isNaN(amount)) return acc;
        return amount < 0 ? acc + Math.abs(amount) : acc;
      }, 0);

      data.push({
        name: d.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
        Ingresos: income,
        Gastos: expense,
      });
    }

    return data;
  }, [allTransactions, currentMonth, currentYear]);

  const formatMoney = (amount) =>
    Number(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "Sin fecha";
    const dateObj = new Date(dateStr);
    if (Number.isNaN(dateObj.getTime())) {
      return String(dateStr).split("T")[0];
    }
    return dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const hasTransactions = allTransactions.length > 0;

  const balanceClass =
    summary.balance >= 0
      ? "summary-value summary-value--positive"
      : "summary-value summary-value--negative";

  return (
    <>
      {/* 1. TARJETAS SUPERIORES (Mes actual) */}
      <section className="dashboard-row">
        <div className="summary-card">
          <p className="summary-label">Balance del mes</p>
          <h2 className={balanceClass}>
            {loading ? "..." : formatMoney(summary.balance)}
          </h2>
          <p className="summary-change">
            Resumen de {monthLabel.toLowerCase()}.
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Ingresos del mes</p>
          <h2 className="summary-value summary-value--income">
            {loading ? "..." : formatMoney(summary.income)}
          </h2>
          <p className="summary-change positive">
            Dinero que ha entrado este mes.
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Gastos del mes</p>
          <h2 className="summary-value summary-value--expense">
            {loading ? "..." : formatMoney(summary.expenses)}
          </h2>
          <p className="summary-change negative">
            Monto total que has gastado.
          </p>
        </div>
      </section>

      {/* 2. FILA PRINCIPAL: GRÁFICO (IZQ) Y LISTA (DER) */}
      <section className="dashboard-row dashboard-row--middle">
        {/* --- GRÁFICO DE INGRESOS VS GASTOS (Mes actual) --- */}
        <div className="panel-card recap-chart-card">
          <div className="panel-header panel-header--with-filter">
            <h3>Flujo de dinero (mes actual)</h3>
            <span className="recap-chart-caption">
              Desde el 1 al día {now.getDate()} de{" "}
              {monthLabel.toLowerCase()}.
            </span>
          </div>

          <div className="recap-chart-wrapper">
            {loading ? (
              <div className="recap-chart-message">
                Cargando gráfico...
              </div>
            ) : !hasTransactions ? (
              <div className="recap-chart-message">
                Aún no hay movimientos este mes. Añade transacciones para
                ver tu flujo aquí.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaData}
                  margin={{ top: 22, right: 20, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="colorIngresos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorGastos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickMargin={10} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="Ingresos"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Gastos"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorGastos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- LISTA DE TRANSACCIONES RECIENTES (Mes actual) --- */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>Transacciones recientes (mes)</h3>
          </div>

          {!loading && !hasTransactions && (
            <p className="recap-empty-text">
              No hay movimientos registrados en{" "}
              {monthLabel.toLowerCase()}.
            </p>
          )}

          <ul className="transactions-list">
            {recentTransactions.map((tx) => {
              const amount = parseFloat(tx.amount);
              const isIncome =
                !Number.isNaN(amount) && amount >= 0;

              return (
                <li className="transaction-item" key={tx.id}>
                  <div
                    className={`transaction-icon transaction-icon--${
                      isIncome ? "green" : "red"
                    }`}
                  >
                    {isIncome ? "💰" : "🛒"}
                  </div>
                  <div className="transaction-info">
                    <span className="transaction-title">
                      {tx.description}
                    </span>
                    <span className="transaction-meta">
                      {formatDateDisplay(tx.date)}
                    </span>
                  </div>
                  <span
                    className={`transaction-amount ${
                      isIncome ? "positive" : "negative"
                    }`}
                  >
                    {formatMoney(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>

          <button
            className="transactions-view-all"
            onClick={onViewAllTransactions}
            type="button"
          >
            Ver todas
          </button>
        </div>
      </section>
    </>
  );
}

export default RecapSection;