const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Verifica la cookie HttpOnly y devuelve el usuario en el mismo formato que /login
router.post("/", (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("token expirado");
      return res.status(403).json({ error: "Token inválido o expirado" });
    }

    // Reconstruir el objeto usuario con los mismos campos que devuelve /login
    const nameParts = (decoded.name || "").split(" ");
    const FirstName = nameParts[0] || "";
    const LastName = nameParts.slice(1).join(" ") || "";

    const user = {
      id_user: decoded.id,
      email: decoded.email,
      FirstName,
      LastName,
      rol: decoded.rol,
    };

    res.status(200).json({ user });
  });
});

module.exports = router;