// src/components/Navbar.jsx
import React from "react";

function Navbar({ onOpenAuth }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo + nombre */}
        <div className="flex items-center space-x-2">
          <div className="logo text-2xl flex items-center space-x-2">
            <div>
              Spend <span>List</span>
            </div>
            <img
              src="/assets/images/logo.png"
              alt="Logo"
              className="w-6 h-6 object-contain align-middle"
            />
          </div>
        </div>

        {/* Botón hamburguesa (mobile) */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="text-2xl">☰</span>
        </button>

        {/* Menú */}
        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row md:space-x-8 absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent border-t md:border-none text-center md:text-left z-10`}
        >
          <a
            href="#features"
            className="block py-2 md:py-0 font-medium hover:text-green-500 transition"
          >
            Features
          </a>
          <a
            href="#about"
            className="block py-2 md:py-0 font-medium hover:text-green-500 transition"
          >
            About us
          </a>
          <a
            href="#contact"
            className="block py-2 md:py-0 font-medium hover:text-green-500 transition"
          >
            Contact
          </a>
          {/* Botón para abrir el modal de auth (opcional aquí) */}
          <button
            onClick={() => onOpenAuth?.("login")}
            className="block py-2 md:py-0 font-medium text-green-600 hover:text-green-500 transition"
          >
            Sign in
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;