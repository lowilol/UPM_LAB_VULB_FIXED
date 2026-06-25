const express = require("express");
const { emailExists, isCorrectPassword, createAccessToken,getUserByEmail} = require("../schema/user");  // Importa las funciones adicionales
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();
const {getUserInfo} = require("../lib/getUserInfo");


router.post("/", async function (req, res, next) {
  
  const  email   = req.body.email;
  const password = req.body.password;
  

  
  try {
 
    if (  !password || !email) {
      
      return res.status(409).json(
        jsonResponse(409, {
          error: "se requiere relenar todos lo parametros ",
        })
      );
    }
    
    const userEmailExists = await emailExists(email);

    if (!userEmailExists ) {
      return res.status(401).json(jsonResponse(401, { error: "El email no existe" }));
    }

    

    

    const passwordCorrect = await isCorrectPassword(email, password);

    if (!passwordCorrect) {
      return res.status(401).json(jsonResponse(401, { error: "Contraseña incorrecta" }));
    }
   
    
    const accessToken = await  createAccessToken(email);
    console.log({ accessToken});


    
    
   
     res.cookie('access_token', accessToken, {
      httpOnly: true,  
      sameSite: 'lax',  
      secure:  false,        
      priority:"Medium",
      maxAge: 3600000,
      
      
       
    });
    const user = await getUserByEmail(email);
    req.session.user = accessToken;

    // F-01 / F-02: Exponer únicamente los campos necesarios; nunca el hash ni metadatos ORM
    const { id_user, email: userEmail, FirstName, LastName, rol } = user.get({ plain: true });
    const safeUser = { id_user, email: userEmail, FirstName, LastName, rol };

    // Devolver la respuesta con la información del usuario
    return res.status(200).json({ user: safeUser, accessToken });
    
  } catch (err) {
    console.log(err);
    return res.status(500).json(jsonResponse(500, { error: "Error interno del servidor" }));
  }
});








module.exports = router;
