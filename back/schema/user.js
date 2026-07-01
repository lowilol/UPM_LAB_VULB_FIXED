const bcrypt = require("bcrypt");
const { generateAccessToken,generateResetPasswordToken } = require("../auth/sign");
const {getUserInfo} = require("../lib/getUserInfo");
const User = require("../models/User");
const sequelize = require('../config/connection');

const Alumno= require("../models/Alumno");
const Profesor= require("../models/Profesor");



const Rol_ = (dominio) =>{
  // Dominio institucional de alumno -> Alumno; de profesor -> Profesor.
  // Para cualquier otro dominio se devuelve null y es responsabilidad del
  // llamante (signup / verifyCode) rechazar el registro. Antes este caso
  // referenciaba variables inexistentes (res, jsonResponse) y tumbaba el
  // proceso del servidor ante un correo no institucional.
  if (dominio === "@alumnos.upm.es") {
    return "Alumno";
  } else if (dominio === "@upm.es") {
    return "Profesor";
  }
  return null;
}

const extraerDominioCorreo = async(correo)=> {

  const partesCorreo = correo.split('@');


  if (partesCorreo.length !== 2) {
    return null;
  }


  const dominio = '@' + partesCorreo[1];


  return dominio;
}

const crearUsuario = async(lastname, password, name, email,rol)=>{

  try {

    await sequelize.authenticate();
    console.log('Conexión exitosa.');




    await sequelize.sync();

    const HashedPass =  await  hashPassword(password);


   console.log(rol)
    newUser = await User.create({

      email: email,
      FirstName: name,
      LastName: lastname,
      rol:rol,
      password: HashedPass,
    });
    console.log("Nuevo usuario creado con ID:", newUser.id);
     if (rol === "Alumno")
      {
        const newAlumno = await Alumno.create({
          id_alumno:newUser.id_user,
          matricuala:null,
          id_user:newUser.id_user
        });
        console.log("Nuevo Alumno creado con ID:", newAlumno.id);

      }

     else if (rol === "Profesor" ) {
      const newProfesor = await Profesor.create({
        id_profesor: newUser.id_user,
        departamento: null,
        id_user: newUser.id_user
      });

      console.log("Nuevo Profesor creado con ID:", newProfesor.id_profesor);
     }


  } catch (error) {
    console.error('Error al interactuar con la base de datos:', error);
  }

}

const hashPassword = async (password) => {
  const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      return hash;
};


const emailExists = async (email) => {
  console.log("--"+User+"--");
  const user = await getUserByEmail (email);

  return !!user;
};



const UserExists = async (FirstName, LastName) => {
  console.log("--"+User+"--");
  const userexist = await getUser(FirstName,LastName) ;


  return !!userexist;
};

const getUserByEmail = async(email)=>{

  return await User.findOne({ where: { email } });
}

const getUser = async(FirstName, LastName)=>{

  return await User.findOne({  where: { FirstName} &&  { LastName} });
}



const isCorrectPassword = async (email, password) => {
  const user =await getUserByEmail (email);
  if (!user) {
    return false;
  }

  const hash = user.password;
  return bcrypt.compare(password, hash);
};


const createAccessToken = async (email) => {
  const user = await getUserByEmail(email);
  const userInfo = getUserInfo(user);
  return await generateAccessToken(userInfo);
};



const createResetPasswordToken = async (email) => {
  const user =  await getUserByEmail(email);
  const userInfo = getUserInfo(user);
  console.log(userInfo);
  const ResetPasswordToken = await generateResetPasswordToken(userInfo);
  return ResetPasswordToken ;
};

async function updatePassword(userId, newPassword) {
  try {

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // La clave primaria de la tabla 'usuario' es id_user (no 'id'); filtrar por
    // 'id' provocaba un error SQL y devolvía 500 al restablecer la contraseña.
    const updatedUser = await User.update(
      { password: hashedPassword },
      { where: { id_user: userId } }
    );


    if (updatedUser[0] === 0) {
      throw new Error('No se pudo actualizar la contraseña. Usuario no encontrado.');
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    throw error;
  }
}

module.exports = {
  Rol_,
  crearUsuario,
  extraerDominioCorreo,
  emailExists,
  getUserByEmail,
  isCorrectPassword,
  createAccessToken,
  createResetPasswordToken,
  hashPassword,
  UserExists,
  getUser,
  updatePassword
};
