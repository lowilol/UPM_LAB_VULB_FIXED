const jwt = require("jsonwebtoken");
require("dotenv").config();

async  function generateAccessToken(user) {
  
  return    jwt.sign(
    user,process.env.ACCESS_TOKEN_SECRET,
      
    {
      expiresIn: '1h',
      algorithm: "HS256",
    }
  );
}


async function generateResetPasswordToken(user) {
 
  return   jwt.sign(
    user,process.env.RESET_PASSWORD_TOKEN,
      
    {
      expiresIn: '1h',
      algorithm: "HS256",
    }
  );
}


module.exports = { generateAccessToken,  generateResetPasswordToken };