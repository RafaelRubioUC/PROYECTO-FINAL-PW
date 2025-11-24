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

// 3. BORRAR UNA TRANSACCIÓN (DELETE)
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params; // El ID viene en la URL
    const userId = req.user.id; // Solo el dueño puede borrar

    const query = "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *";
    const { rows, rowCount } = await db.query(query, [id, userId]);

    // Si rowCount es 0, significa que no encontró la transacción O no es tuya
    if (rowCount === 0) {
      return res.status(404).json({ message: "Transacción no encontrada o no autorizada" });
    }

    return res.json({
      success: true,
      message: "Transacción eliminada",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar" });
  }
};

// 4. ACTUALIZAR UNA TRANSACCIÓN (PUT)
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, description, date } = req.body;

    // Solo actualizamos si la transacción pertenece al usuario (AND user_id = $4)
    const query = `
      UPDATE transactions 
      SET amount = $1, description = $2, date = $3
      WHERE id = $5 AND user_id = $4
      RETURNING *
    `;

    // Si no mandan fecha nueva, usamos la actual o mantenemos la anterior (lógica simple aquí)
    // Para simplificar, asumimos que el frontend manda la fecha correcta.
    const transactionDate = date || new Date();

    const { rows, rowCount } = await db.query(query, [amount, description, transactionDate, userId, id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: "Transacción no encontrada o no autorizada" });
    }

    return res.json({
      success: true,
      message: "Transacción actualizada",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar" });
  }
};
