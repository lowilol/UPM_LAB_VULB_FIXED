const express = require("express");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();
const { generateVerificationCode,sendVerificationEmail} = require("../auth/verify");

const { UserExists,emailExists,extraerDominioCorreo,Rol_} = require("../schema/user");


router.post("/", async function (req, res, next) {
  const { lastname, password, name, email} = req.body;



  if ( !lastname || !password || !name || !email) {
    return res.status(409).json(
      jsonResponse(409, {
        error: "se requiere relenar todos lo parametros ",
      })
    );
  }

  
  console.log("hola")
   
  const dominio = await extraerDominioCorreo(email);
  let rol = Rol_(dominio)

  console.log(rol)

  try {
    const emailEx = await emailExists(email);
    const userEx = await UserExists(name,lastname);

    if (userEx || emailEx) {
      return res.status(409).json(
        jsonResponse(409, {
          error: " ya existe el usuario",
        })
      );
     
    } else {
      
      const verificationCode =   await generateVerificationCode(email);
      console.log(verificationCode);
        sendVerificationEmail(email, verificationCode);
       res.status(200).json({ message: `Código enviado a ${email}` });
    }
  } catch (err) {
    return res.status(500).json(
      jsonResponse(500, {
        error: "Error al procesar el registro.",
      })
    );
    
  }
});

module.exports = router;