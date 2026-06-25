const express = require('express');
const router = express.Router();
const Laboratorio = require('../models/Laboratorio');
const  Usuario  = require('../models/User');
const Turno = require('../models/Turno');
const  Profesor  = require('../models/Profesor');
const fs = require('fs');
const path = require('path');
// F-03: Proteger todas las rutas con autenticación JWT
const authenticateToken = require('../auth/authenticateToken');

const transporter = require('../config/email'); 

// Crear un laboratorio
router.post('/', authenticateToken, async (req, res) => {
  const { nombre_laboratorio, ubicacion, capacidad } = req.body;

  try {
    if (!nombre_laboratorio || !ubicacion || !capacidad) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const laboratorioExistente = await Laboratorio.findOne({ where: { nombre_laboratorio } });
    if (laboratorioExistente) {
      return res.status(400).json({ error: 'El nombre del laboratorio ya existe. Por favor, elija otro.' });
    }

    const nuevoLaboratorio = await Laboratorio.create({ nombre_laboratorio, ubicacion, capacidad });
    res.status(201).json({ message: 'Laboratorio creado exitosamente', laboratorio: nuevoLaboratorio });
  } catch (error) {
    console.error('Error al crear el laboratorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los laboratorios
router.get('/', authenticateToken, async (req, res) => {
  try {
    const laboratorios = await Laboratorio.findAll();
    res.status(200).json(laboratorios);
  } catch (error) {
    console.error('Error al obtener los laboratorios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener un laboratorio por ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const laboratorio = await Laboratorio.findByPk(id);

    if (!laboratorio) {
      return res.status(404).json({ error: 'Laboratorio no encontrado' });
    }

    res.status(200).json(laboratorio);
  } catch (error) {
    console.error('Error al obtener el laboratorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un laboratorio
router.put('/:id', authenticateToken, async (req, res) => {
  const  id  = req.body.id_laboratorio;
  const  capacidad  = req.body.capacidad;

  try {
    const laboratorio = await Laboratorio.findByPk(id);

    if (!laboratorio) {
      return res.status(404).json({ error: 'Laboratorio no encontrado' });
    }
    console.log(laboratorio.id_laboratorio)
    const [rowsUpdated] = await Laboratorio.update(
      { capacidad: parseInt(capacidad, 10) }, 
      { where: { id_laboratorio: id } } 
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({ error: 'Laboratorio no encontrado' });
    }
    res.status(200).json({ message: 'Laboratorio actualizado exitosamente', laboratorio });
  } catch (error) {
    console.error('Error al actualizar el laboratorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//deshabilitar

router.post("/deshabilitar/:id_laboratorio", authenticateToken, async (req, res) => {
  const { id_laboratorio } = req.params;
  const { id_user } = req.body; 
  console.log("deshablilitar"+  id_user)
  try {
      const laboratorio = await Laboratorio.findByPk(id_laboratorio);

      if (!laboratorio) {
          return res.status(404).json({ error: "Laboratorio no encontrado" });
      }

      if (laboratorio.deshabilitado) {
          return res.status(400).json({ error: "El laboratorio ya está deshabilitado." });
      }

     
      laboratorio.deshabilitado = true;
      await laboratorio.save();

      const user_PAS =  await Usuario.findByPk(id_user)
      console.log(user_PAS.FirstName)
      const profesores = await Profesor.findAll(
        {include: {
          model: Usuario,
          as: "usuario",
          attributes: ["FirstName", "LastName", "email"],
      },}
      );

      
      const emailTemplatePath = path.join(__dirname, "../templates/email_deshabilitacion_lab.html");
      let emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: "utf-8" });

      const emailPromises = profesores.map((profesor) => {
          const email = profesor.usuario.email;
          const nombreProfesor = `${profesor.usuario.FirstName} ${profesor.usuario.LastName}`;
          const nombrePAS = `${user_PAS.FirstName} ${user_PAS.LastName}`;
          const emailPAS = user_PAS.email;
          

          const mensaje = emailTemplate
              .replace("${profesorNombre}", nombreProfesor)
              .replace("${nombrelab}", laboratorio.nombre_laboratorio)
              .replace("${nombrePAS}", nombrePAS)
              .replace("${emailPAS}", emailPAS).replace("${emailPAS}", emailPAS);

          return transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Preaviso: Laboratorio será eliminado",
              html: mensaje,
          });
      });

      await Promise.all(emailPromises);
console.log("correo enviado")
      res.status(200).json({ message: "Laboratorio deshabilitado y correos enviados.uu" });
  } catch (error) {
      console.error("Error al deshabilitar el laboratorio:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
});

//habilitar
router.post("/habilitar/:id_laboratorio", authenticateToken, async (req, res) => {
  const { id_laboratorio } = req.params;
  const { id_user } = req.body; 
  console.log("hablilitar" +  id_user)
  try {
      const laboratorio = await Laboratorio.findByPk(id_laboratorio);

      if (!laboratorio) {
          return res.status(404).json({ error: "Laboratorio no encontrado" });
      }

      if (!laboratorio.deshabilitado) {
          return res.status(400).json({ error: "El laboratorio ya está habilitado." });
      }

      
      laboratorio.deshabilitado = false;
      await laboratorio.save();


      const user_PAS =  await Usuario.findByPk(id_user)
      console.log(user_PAS.FirstName)
      const profesores = await Profesor.findAll({
          
              
          include: {
              model: Usuario,
              as: "usuario",
              attributes: ["FirstName", "LastName", "email"],
          },
      
  });

  
  const emailTemplatePath = path.join(__dirname, "../templates/email_habilitacion_lab.html");
  let emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: "utf-8" });

  const emailPromises = profesores.map((profesor) => {
      const email = profesor.usuario.email;
      const nombreProfesor = `${profesor.usuario.FirstName} ${profesor.usuario.LastName}`;
      const nombrePAS = `${user_PAS.FirstName} ${user_PAS.LastName}`;
      const emailPAS = user_PAS .email;
      
      const mensaje = emailTemplate
          .replace("${profesorNombre}", nombreProfesor)
          .replace("${nombrelab}", laboratorio.nombre_laboratorio)
          .replace("${nombrePAS}", nombrePAS)
          .replace("${emailPAS}", emailPAS).replace("${emailPAS}", emailPAS);

      return transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: " aviso: rehabilitación del laboratorio",
          html: mensaje,
      });
  });

  await Promise.all(emailPromises);
  console.log("correo enviado")

      res.status(200).json({ message: "Laboratorio habilitado exitosamente.uu" });
  } catch (error) {
      console.error("Error al habilitar el laboratorio:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
});







// Eliminar un laboratorio
router.delete('/:id_laboratorio_user', authenticateToken, async (req, res) => {
  const param = req.params.id_laboratorio_user;
  
  console.log( "param --------- " + param ) 
  const [id_laboratorio, id_user] = param.split("X");
  console.log( "id_laboratorio--------- " + id_laboratorio) 
  console.log( "id user--------- " + id_user) 

   const emailTemplatePath = path.join(__dirname, '../templates/email_Eliminacion_lab.html');
  let emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' });

  try {
    const laboratorio = await Laboratorio.findByPk(id_laboratorio);
    

    if (!laboratorio) {
      return res.status(404).json({ error: 'Laboratorio no encontrado' });
    }



    const profesores = await Profesor.findAll({
      include: {
        model: Usuario,
        as: 'usuario',
        attributes: ['FirstName', 'LastName', 'email'],
      },
    });

    const PAS = await Usuario.findAll({
      where: { rol: 'PAS' , id_user: id_user}, // Filtra los usuarios con el rol 'PAS'
      attributes: ['FirstName', 'LastName', 'email'], // Devuelve solo los campos necesarios
    });

    console.log(JSON.stringify(PAS, null, 2));
    
    for (const profesor of profesores) {
      const email = profesor.usuario.email;
      const profesorNombre = `${profesor.usuario.FirstName} ${profesor.usuario.LastName}`;
      const asunto = 'Preaviso: Laboratorio Deshabilitado';
      const emailPas = PAS.email
      const nombrePAS = `${PAS.FirstName} ${PAS.LastName}`
     const mensaje = emailTemplate
      .replace('${ProfesorNombre}', profesorNombre)
      .replace('${nombrelab}', laboratorio.nombre_laboratorio)
      .replace('${emailPAS}', emailPas ).replace('${nombrepas}', nombrePAS );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: asunto,
        text: mensaje,
      };

      await transporter.sendMail(mailOptions);
    }

    await Turno.destroy({ where: { id_laboratorio } });
    await Laboratorio.destroy({ where: { id_laboratorio } });
    res.status(200).json({ message: 'Laboratorio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el laboratorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;