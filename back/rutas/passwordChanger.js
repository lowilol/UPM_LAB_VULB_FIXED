const express = require("express");
const {updatePassword} = require("../schema/user");
const router = express.Router();
const { verifyResetPasswordToken  } = require("../auth/verify");

router.post("/:token", async function (req, res) {
  const { token } = req.params; 
  const { newPassword } = req.body;
  
  console.log(token);
  if (!newPassword) {
    return res.status(400).json({ error: 'Se requiere una nueva contraseña' });
  }

  try {
    // Verifica y decodifica el token
    const decodedToken =  verifyResetPasswordToken(token); // Función que verifica el token
    console.log("Token decodificado:", decodedToken);
    if (!decodedToken) {
      return res.status(400).json({ error: ' la sesion ha expirado' });
    }
    await updatePassword(decodedToken.id, newPassword)   
    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
 } catch (error) {
          console.error('Error al interactuar con la base de datos:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
   }
     
      

      
  
});

module.exports = router;