import { Router } from 'express';
// 1. Importamos la función que acabas de crear (El Cajero)
import { getCategories } from '../controllers/categories.controller.js';
// 2. Importamos al Guardia de Seguridad
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// 3. Definimos la ruta
// Cuando alguien pida GET /categories -> Revisa Token -> Entrega Categorías
router.get('/categories', authRequired, getCategories);

export default router;
