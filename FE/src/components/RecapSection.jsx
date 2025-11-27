import React, { useState, useEffect, useMemo } from "react";
// Solo importamos lo necesario para el gráfico de Área
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function RecapSection({ onViewAllTransactions }) {
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const response = await fetch(`${API_URL}/api/transactions`, { headers });
        const data = await response.json();

        if (data.success) {
          const allTx = data.data;
          setAllTransactions(allTx);

          // Calcular Totales
          let income = 0;
          let expense = 0;

          allTx.forEach((tx) => {
            const amount = parseFloat(tx.amount);
            if (amount >= 0) income += amount;
            else expense += amount;
          });

          setSummary({
            balance: income + expense,
            income: income,
            expenses: expense,
          });

          setRecentTransactions(allTx.slice(0, 4));
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- GRÁFICO DE ÁREA (TIEMPO) ---
  const areaData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const dayTxs = allTransactions.filter((tx) => tx.date.startsWith(dateStr));

      const income = dayTxs.reduce((acc, tx) => (parseFloat(tx.amount) > 0 ? acc + parseFloat(tx.amount) : acc), 0);
      const expense = dayTxs.reduce(
        (acc, tx) => (parseFloat(tx.amount) < 0 ? acc + Math.abs(parseFloat(tx.amount)) : acc),
        0
      );

      data.push({
        name: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        Ingresos: income,
        Gastos: expense,
      });
    }
    return data;
  }, [allTransactions]);

  const formatMoney = (amount) => Number(amount).toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <>
      {/* 1. TARJETAS SUPERIORES */}
      <section className="dashboard-row">
        <div className="summary-card">
          <p className="summary-label">Balance total</p>
          <h2 className="summary-value" style={{ color: summary.balance >= 0 ? "#10b981" : "#ef4444" }}>
            {loading ? "..." : formatMoney(summary.balance)}
          </h2>
          <p className="summary-change">Basado en movimientos registrados.</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Ingresos</p>
          <h2 className="summary-value" style={{ color: "#10b981" }}>
            {loading ? "..." : formatMoney(summary.income)}
          </h2>
          <p className="summary-change positive">Dinero ganado.</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Gastos</p>
          <h2 className="summary-value" style={{ color: "#ef4444" }}>
            {loading ? "..." : formatMoney(summary.expenses)}
          </h2>
          <p className="summary-change negative">Dinero gastado.</p>
        </div>
      </section>

      {/* 2. FILA PRINCIPAL: GRÁFICO (IZQ) Y LISTA (DER) */}
      <section className="dashboard-row dashboard-row--middle">
        {/* --- GRÁFICO DE INGRESOS VS GASTOS (Movido aquí) --- */}
        <div className="panel-card">
          <div className="panel-header panel-header--with-filter">
            <h3>Flujo de Dinero (7 días)</h3>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" style={{ fontSize: "0.8rem" }} />
                <YAxis style={{ fontSize: "0.8rem" }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="Gastos" stroke="#ef4444" fillOpacity={1} fill="url(#colorGastos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- LISTA DE RECIENTES --- */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>Transacciones recientes</h3>
          </div>
          <ul className="transactions-list">
            {recentTransactions.length === 0 && !loading && (
              <p style={{ color: "#64748b", padding: "10px" }}>No hay movimientos.</p>
            )}
            {recentTransactions.map((tx) => (
              <li className="transaction-item" key={tx.id}>
                <div className={`transaction-icon transaction-icon--${parseFloat(tx.amount) >= 0 ? "green" : "red"}`}>
                  {parseFloat(tx.amount) >= 0 ? "💰" : "🛒"}
                </div>
                <div className="transaction-info">
                  <span className="transaction-title">{tx.description}</span>
                  <span className="transaction-meta">{new Date(tx.date).toLocaleDateString()}</span>
                </div>
                <span className={`transaction-amount ${parseFloat(tx.amount) >= 0 ? "positive" : "negative"}`}>
                  {formatMoney(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
          <button className="transactions-view-all" onClick={onViewAllTransactions}>
            Ver todas
          </button>
        </div>
      </section>
    </>
  );
}

export default RecapSection;
