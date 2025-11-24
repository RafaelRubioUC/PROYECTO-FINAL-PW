import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: No se encontró DATABASE_URL en el archivo .env");
  process.exit(1);
}

// Creamos la Pool
export const db = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Si ocurre un error inesperado en la conexión (ej: Neon la cierra),
// esto evita que el servidor se caiga .
db.on("error", (err, client) => {
  console.error("Error inesperado en la base de datos:", err);
  process.exit(-1); // Opcional: Reiniciar el proceso para reconectar limpio
});

// Usamos .query() directo para que la conexión se libere sola.
db.query("SELECT NOW()")
  .then((res) => {
    console.log("Conexión exitosa a Neon Tech (PostgreSQL)");
  })
  .catch((err) => {
    console.error("Error al conectar a la Base de Datos:", err.message);
  });
