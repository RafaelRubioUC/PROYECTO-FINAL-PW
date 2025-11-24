import { Router } from "express";
// Importamos al controlador
import { getTransactions, createTransaction } from "../controllers/transactions.controller.js";
// Importamos al middleware (Guardia)
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

// Si el guardia no dice "next()", la función getTransactions NUNCA se ejecuta.

router.get("/transactions", authRequired, getTransactions);
router.post("/transactions", authRequired, createTransaction);

export default router;
