const express = require('express');
const transporter = require('../config/email');  
const { emailExists,createResetPasswordToken} = require("../schema/user");
const router = express.Router();
const { jsonResponse } = require("../lib/jsonResponse");
const fs = require('fs');
const path = require('path');
require("dotenv").config();



router.post('/', async (req, res) => {
  const { email } = req.body;
  const emailTemplatePath = path.join(__dirname, '../templates/email_reset_password.html');
  let emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' });
  
 
  if ( !email) {
    
    return res.status(409).json(
      jsonResponse(409, {
        error: "se requiere relenar todos lo parametros ",
      })
    );
  }
  try {
  const userEmailExists = await emailExists(email);
   

  if (!userEmailExists ) {
    return res.status(404).json( jsonResponse(409, {
      error: "correo no encontrado ",
    }));
  }
  
  
  
  const resetToken = await  createResetPasswordToken(email);
  console.log(resetToken)

  
  const resetLink = `http://localhost:3000/changerpassword/${resetToken}`;
  
  emailTemplate = emailTemplate.replace('${resetLink}', resetLink);
   
  

  const mailOptions ={
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    html:emailTemplate,
  }
 transporter.sendMail(mailOptions);
    res.status(200).json(jsonResponse(200, {
      request: " correo enviado ",
    }));
  } catch (error) {
    return res.status(400).json(
      jsonResponse(400, {
        error: "No se ha podido enviar el correo ",
      })
    );
  }
});

module.exports = router;