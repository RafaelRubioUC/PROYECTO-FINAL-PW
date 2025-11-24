import { db } from "../db/connection.js";

// 1. OBTENER MIS TRANSACCIONES (GET)
export const getTransactions = async (req, res) => {
  try {
    // El ID viene del token (gracias al middleware)
    const userId = req.user.id;

    // Consulta SQL: "Dame todo, pero SOLO donde el dueño sea este usuario"
    const query = "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC";
    const { rows } = await db.query(query, [userId]);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener transacciones" });
  }
};

// 2. CREAR UNA TRANSACCIÓN (POST)
export const createTransaction = async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    const userId = req.user.id; // Asignamos la transacción al usuario logueado

    // Validación básica
    if (!amount) {
      return res.status(400).json({ message: "El monto (amount) es obligatorio" });
    }

    // Insertar en Base de Datos
    // Nota: Dejamos category_id en NULL por ahora hasta que programemos las categorías
    const query = `
      INSERT INTO transactions (amount, description, date, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    // Si no mandan fecha, ponemos la de hoy (usando undefined para que SQL use el DEFAULT)
    const transactionDate = date || new Date();

    const { rows } = await db.query(query, [amount, description, transactionDate, userId]);

    res.status(201).json({
      success: true,
      message: "Transacción guardada",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar transacción", error: error.message });
  }
};
