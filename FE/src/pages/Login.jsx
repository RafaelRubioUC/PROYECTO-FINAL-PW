import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiLock, FiMail } from "react-icons/fi";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí luego irá la llamada al backend (Express + JWT)
    console.log("Login data:", form);
  };

  return (
    <section className="hero-pages">
      <div className="auth-card">
        {/* Encabezado con candado */}
        <div className="auth-header">
          <div className="auth-lock-icon">
            <FiLock />
          </div>
          <h1 className="auth-title">Bienvenido de nuevo</h1>
          <p className="auth-subtitle">
            Inicia sesión en tu cuenta de SpendList para continuar
            administrando tus finanzas.
          </p>
        </div>

        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="auth-field">
            <div className="auth-field-header">
              <span>Email address</span>
            </div>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <FiMail />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-field-header">
              <span>Password</span>
              <button
                type="button"
                className="auth-link auth-link--small"
              >
                Forgot password?
              </button>
            </div>

            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <FiLock />
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Remember me */}
          <div className="auth-options">
            <label className="auth-remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Botón principal */}
          <button type="submit" className="btn auth-submit">
            Sign in
          </button>
        </form>

        {/* Link a registro */}
        <p className="auth-footer-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;