const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../auth/verify");
const Alumno = require("../models/Alumno");
const Profesor = require("../models/Profesor");

router.put("/updateProfile", verifyAccessToken, async (req, res) => {
    const { id_user, rol, matricula, departamento } = req.body.id_user;

    console.log (req.body)
    console.log (rol)
    if ((!id_user && !rol ) && (rol === "Alumno" && !matricula) || (rol === "Profesor" && !departamento)) {
        return res.status(400).json({ error: "Datos incompletos o inválidos." });
    }
    try {
        if (rol === "Alumno") {

            const regexMatricula = /^[A-Za-z]{2}\d{4}$/;
            if(!regexMatricula.test(matricula)){
                return res.status(400).json({ error: "matricula invalida." }); 
            }
            await Alumno.update({ matricula }, { where: { id_alumno: id_user } });
            return res.status(200).json({ message: "Matrícula actualizada correctamente." });
        }
        if (rol === "Profesor") {
            const regexDepartamento = /^[1-9][1-9][0-9]{2}$/;
            if(!regexDepartamento.test(matricula)){
                return res.status(400).json({ error: "departamento invalida." }); 
            }
            await Profesor.update({ departamento }, { where: { id_profesor: id_user } });
            return res.status(200).json({ message: "Departamento actualizado correctamente." });
        }

        return res.status(400).json({ error: "Rol no reconocido." });
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

module.exports = router;