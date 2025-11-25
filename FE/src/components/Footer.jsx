// src/components/Footer.jsx
import React from "react";
import { FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Parte de arriba: logo + redes */}
        <div className="footer-top">
          <div className="footer-logo">
            Spend<span>List</span>
          </div>

          <div className="footer-social">
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p>© 2025 SpendList. All rights reserved.</p>

          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Help &amp; Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;