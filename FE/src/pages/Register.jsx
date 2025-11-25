import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiUserPlus, FiUser, FiMail, FiLock } from "react-icons/fi";

function Register() {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!form.acceptTerms) {
      alert("Debes aceptar los Términos y la Política de Privacidad.");
      return;
    }

    // Más adelante, aquí irá el POST al backend (Express + JWT).
    console.log("Register data:", form);
  };

  return (
    <section className="hero-pages">
      <div className="auth-card">
        {/* Encabezado con icono de usuario + */}
        <div className="auth-header">
          <div className="auth-lock-icon">
            <FiUserPlus />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Join SpendList to manage and understand your finances in a simpler
            way.
          </p>
        </div>

        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full name */}
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

            <p className="auth-helper">
              Use 8 or more characters with a mix of letters, numbers &amp;
              symbols.
            </p>
          </div>

          {/* Confirm password */}
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

          {/* Términos y privacidad */}
          <div className="auth-terms">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
            />
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

          {/* Botón principal */}
          <button type="submit" className="btn auth-submit">
            Create Account
          </button>
        </form>

        {/* Link a login */}
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