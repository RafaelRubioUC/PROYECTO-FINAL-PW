import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
    return (
        <section className="hero">
            <h1>Simplifica y mejora tus finanzas</h1>
            <p>Un enfoque minimalista para gestionar tu dinero. Controla tus gastos, establece presupuestos y logra claridad financiera. ¿Qué esperas?</p>
            <Link to="/register" className="btn btn-register">Regístrate</Link>
        </section>
    );
}
// En 'Link to="/register", esa será la página donde será redirigido el usuario al presionar el botón //
export default Hero;