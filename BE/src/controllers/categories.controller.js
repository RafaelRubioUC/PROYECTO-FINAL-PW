// BE/src/controllers/categories.controller.js

import { db } from '../db/connection.js';

export const getCategories = async (req, res) => {
  try {
    // Traemos todas las categorías 
    const query = 'SELECT * FROM categories WHERE user_id IS NULL ORDER BY name ASC';
    const { rows } = await db.query(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};