const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  // Leer token de cookie HttpOnly (preferido) o header Authorization (fallback)
  const token = req.cookies?.access_token ||
    (req.headers["authorization"]?.startsWith("Bearer ")
      ? req.headers["authorization"].split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token inválido:", err.message);
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
    req.user = decoded.user ?? decoded;
    next();
  });
}
module.exports = authenticateToken;
