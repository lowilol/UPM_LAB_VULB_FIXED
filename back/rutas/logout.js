const express = require("express");
const router = express.Router();

router.delete("/", function (req, res) {
  // Borrar la cookie HttpOnly del token de sesión
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  return res.status(200).json({ message: "Sesión cerrada correctamente" });
});

module.exports = router;