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

// 2. CREAR TRANSACCION
export const createTransaction = async (req, res) => {
  try {
    // RECIBIMOS category_id
    const { amount, description, date, category_id } = req.body;
    const userId = req.user.id;

    if (!amount) {
      return res.status(400).json({ message: "El monto es obligatorio" });
    }

    // Agregamos la columna category_id al INSERT
    const query = `
      INSERT INTO transactions (amount, description, date, user_id, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const transactionDate = date || new Date();

    // Pasamos el category_id como el parámetro $5
    const { rows } = await db.query(query, [amount, description, transactionDate, userId, category_id]);

    res.status(201).json({
      success: true,
      message: "Transacción guardada",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar", error: error.message });
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

// 4. ACTUALIZAR TRANSACCION
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // Recibimos también category_id para poder cambiarla si nos equivocamos
    const { amount, description, date, category_id } = req.body;

    const query = `
      UPDATE transactions 
      SET amount = $1, description = $2, date = $3, category_id = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;

    const transactionDate = date || new Date();

    // Pasamos los parámetros en orden correcto
    const { rows, rowCount } = await db.query(query, [amount, description, transactionDate, category_id, id, userId]);

    if (rowCount === 0) return res.status(404).json({ message: "No encontrada" });

    return res.json({
      success: true,
      message: "Actualizada",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar" });
  }
};
