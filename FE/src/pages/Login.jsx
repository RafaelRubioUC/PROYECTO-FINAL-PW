import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <--- Agregamos useNavigate
import { FiLock, FiMail } from "react-icons/fi";

function Login() {
  const navigate = useNavigate(); // <--- Hook para navegar
  const API_URL = import.meta.env.VITE_API_URL;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Petición al Backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json(); //convierte en un objeto de javascript, extrae lo importante

      // 2. Verifica que la comunicacion http entre el navegador y el servidor fue exitosa
      if (response.ok) {
        // ¡Login Exitoso!
        // Guardamos el token en el navegador para usarlo después
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("¡Bienvenido! Sesión iniciada.");

        // Redirigir al Dashboard o Home
        navigate("/dashboard"); // <--- Navega al dashboard
      } else {
        // Error (contraseña mal, usuario no existe)
        alert(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <section className="hero-pages">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-lock-icon">
            <FiLock />
          </div>
          <h1 className="auth-title">Bienvenido de nuevo</h1>
          <p className="auth-subtitle">
            Inicia sesión en tu cuenta de SpendList para continuar administrando tus finanzas.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <div className="auth-field">
            <div className="auth-field-header">
              <span>Password</span>
              <button type="button" className="auth-link auth-link--small">
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

          <div className="auth-options">
            <label className="auth-remember">
              <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
              <span>Remember me</span>
            </label>
          </div>

          <button type="submit" className="btn auth-submit">
            Sign in
          </button>
        </form>

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
