import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <--- Importante
import { FiUserPlus, FiUser, FiMail, FiLock } from "react-icons/fi";

function Register() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
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

  // Validaciones del Frontend
  if (form.password !== form.confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (!form.acceptTerms) {
    alert("Debes aceptar los Términos y la Política de Privacidad.");
    return;
  }

  try {
    // Petición al Backend
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,   // Enviamos el nombre (el backend ya sabe manejarlo)
        email: form.email,
        password: form.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const { token, user } = data;

      if (token && user) {
        // Guardamos token en dos keys (por si luego usamos spendlist_token)
        localStorage.setItem("token", token);
        localStorage.setItem("spendlist_token", token);

        // Guardamos usuario completo y versión plana para el Dashboard
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem(
          "spendlist_user",
          JSON.stringify({
            id: user.id ?? user._id,
            name: user.name,
            email: user.email,
          })
        );

        alert("¡Cuenta creada exitosamente! Hemos iniciado tu sesión.");
        navigate("/dashboard"); // Redirige de una vez al dashboard
      } else {
        // Backend no envió token/user, usamos flujo antiguo
        alert("¡Cuenta creada exitosamente! Ahora inicia sesión.");
        navigate("/login"); // Redirigir al login
      }
    } else {
      // Registro NO ok: mostramos mensaje de error del backend
      alert(data.message || "Error al registrarse");
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
            <FiUserPlus />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join SpendList to manage and understand your finances in a simpler way.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="auth-field">
            <div className="auth-field-header">
              <span>Full Name</span>
            </div>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <FiUser />
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

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
            <p className="auth-helper">Use 8 or more characters with a mix of letters, numbers & symbols.</p>
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <div className="auth-field-header">
              <span>Confirm Password</span>
            </div>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <FiLock />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Terms */}
          <div className="auth-terms">
            <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
            <span>
              I agree to the{" "}
              <button type="button" className="auth-link auth-link--inline">
                Terms
              </button>{" "}
              and{" "}
              <button type="button" className="auth-link auth-link--inline">
                Privacy Policy
              </button>
              .
            </span>
          </div>

          <button type="submit" className="btn auth-submit">
            Create Account
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
