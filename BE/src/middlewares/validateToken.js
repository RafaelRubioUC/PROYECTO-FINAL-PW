import jwt from "jsonwebtoken";

// Este es el middleware
export const authRequired = (req, res, next) => {
  try {
    // 1. Buscamos el token en la cabecera "Authorization"
    // El frontend lo manda así: "Bearer eyJhbGciOiJIUz..."
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "Acceso denegado: No hay token" });
    }

    // 2. Limpiamos el token (quitamos la palabra "Bearer " si viene)
    const token = authHeader.split(" ")[1] || authHeader;

    if (!token) {
      return res.status(401).json({ message: "Acceso denegado: Token vacío" });
    }

    // 3. Verificamos la firma con nuestra CLAVE SECRETA
    jwt.verify(token, process.env.JWT_SECRET, (err, userDecoded) => {
      if (err) {
        return res.status(403).json({ message: "Token inválido o expirado" });
      }

      // 4. Guardamos los datos del usuario dentro de la petición (req)
      // Así, la siguiente función sabrá exactamente quién eres (ID 1, ID 5, etc.)
      req.user = userDecoded;

      // 5. Dejamos pasar
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Error interno de autenticación" });
  }
};
