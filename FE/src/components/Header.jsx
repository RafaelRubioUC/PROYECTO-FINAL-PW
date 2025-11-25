import { useEffect, useState } from "react"; // <-- Importa useState
import { Link } from "react-router-dom";
import logoIcon from "/assets/logo-icon.jpeg";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
   <header className="header">
      {/* Logo + texto */}
      <Link to="/" className="header-logo" onClick={closeMenu}>
        <img
          src={logoIcon}
          alt="Logo SpendList"
          className="header-logo-icon"
        />
        <span className="header-logo-text">
          Spend<span className="header-logo-highlight">List</span>
        </span>
      </Link>

      {/* Botón hamburguesa (solo en móvil) */}
      <button
        className="menu-toggle"
        onClick={toggleMenu}
        aria-label="Abrir o cerrar menú de navegación"
      >
        ☰
      </button>

      {/* Navegación */}
      <nav
        className={
          menuOpen ? "nav-links nav-links--open" : "nav-links"
        }
      >
        <a href="#about" className="nav-link" onClick={closeMenu}>
          About us
        </a>
        <a href="#contact" className="nav-link" onClick={closeMenu}>
          Contact
        </a>

        <div className="nav-auth">
          <Link
            to="/login"
            className="btn btn-login"
            onClick={closeMenu}
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;