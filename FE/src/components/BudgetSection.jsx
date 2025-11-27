import React from "react";

function BudgetSection() {
  return (
    <section className="dashboard-row">
      <div className="panel-card full-width">
        <div className="panel-header">
          <h3>Budget</h3>
        </div>
        <div className="chart-placeholder">
          Aquí configuraremos los presupuestos por categoría.
        </div>
      </div>
    </section>
  );
}

export default BudgetSection;