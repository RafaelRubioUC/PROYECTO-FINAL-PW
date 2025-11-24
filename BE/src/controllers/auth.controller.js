import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/connection.js";

// 1. REGISTRAR USUARIO (Versión Limpia: Solo Email y Password)
export const register = async (req, res) => {
  try {
    const { email, password } = req.body; // Ya no pedimos 'name'

    // Validación estricta solo para lo que importa
    if (!email || !password) {
      return res.status(400).json({ message: "Faltan datos (email o password)" });
    }

    // A) Verificar si ya existe
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // B) Encriptar
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // C) Guardar
    const query = `
      INSERT INTO users (email, password) 
      VALUES ($1, $2) 
      RETURNING id, email, created_at`;

    const newUser = await db.query(query, [email, hashedPassword]);

    // D) Generar Token
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      success: true,
      message: "Usuario registrado",
      token,
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// 2. INICIAR SESIÓN (LOGIN)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // A) Buscar usuario
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // B) Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // C) Generar Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Ocultar el password antes de enviarlo
    delete user.password;

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
