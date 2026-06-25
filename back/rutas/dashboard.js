const express = require("express");
const router = express.Router();
const authenticateToken = require('../auth/authenticateToken');
const Profesor = require('../models/Profesor');
const Alumno = require('../models/Alumno');
const { emailExists, getUserByEmail } = require("../schema/user");

router.post("/", authenticateToken, async function (req, res, next) {
  const email = req.body.email;

  console.log("Email recibido:", email);

  const userEmailExists = await emailExists(email);
  if (!userEmailExists) {
    return res.status(401).json({ error: "El email no existe" });
  }

  const user = await getUserByEmail(email);

  let missingData = null;
  let SpecificDateUser = null;
  const alumno = await Alumno.findOne({ where: { id_alumno: user.id_user } });
  const profesor = await Profesor.findOne({ where: { id_profesor: user.id_user } });

  if (user.rol === "Alumno") {
    if (!alumno?.matricula) missingData = "matricula";
    else SpecificDateUser = alumno?.matricula;
  } else if (user.rol === "Profesor") {
    if (!profesor?.departamento) missingData = "departamento";
    else SpecificDateUser = profesor?.departamento;
  }

  const { id_user, email: userEmail, FirstName, LastName, rol } = user.get({ plain: true });
  const safeUser = { id_user, email: userEmail, FirstName, LastName, rol, specificData: SpecificDateUser };

  res.json({ missingData, user: safeUser });
});

module.exports = router;