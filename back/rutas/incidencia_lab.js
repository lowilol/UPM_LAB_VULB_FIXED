const express = require('express');
const router = express.Router();
// F-03: Proteger todas las rutas de incidencias de laboratorio
const authenticateToken = require('../auth/authenticateToken');

const  Usuario  = require('../models/User');


const  Profesor  = require('../models/Profesor');
const  Laboratorio  = require('../models/Laboratorio');
const  IncidenciaLab  = require('../models/Incidencia_lab');
const Turno = require("../models/Turno")

const fs = require('fs');
const path = require('path');
const transporter = require('../config/email');


router.delete('/:id_incidencia', authenticateToken, async (req, res) => {
    const { id_incidencia} = req.params;
    
    
    try {
      const incidencia = await IncidenciaLab.findByPk(id_incidencia);
      
  
      if (!incidencia) {
        return res.status(404).json({ error: 'Laboratorio no encontrado' });
      }
  
      await IncidenciaLab.destroy({ where: { id_incidencia } });
     
      res.status(200).json({ message: 'inicidencia eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el laboratorio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  })




router.post('/', authenticateToken, async (req, res) => {
    const { id_laboratorio, incidencia ,id_user,descripcion_incidencia } = req.body;
    const emailTemplatePath = path.join(__dirname, '../templates/email_incidencia_lab.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' });
    console.log(id_user)
    try {
        
        const laboratorio = await Laboratorio.findByPk(id_laboratorio, {
            include: [
                {
                    model: Turno,
                    as: 'turno',
                    include: [
                        {
                            model: Profesor,
                            as: 'profesor',
                            include: [
                                {
                                    model: Usuario,
                                    as: 'usuario',
                                    attributes: ['FirstName', 'LastName', 'email'],
                                    
                                },
                            ],
                        },
                    ],
                },
            ],
        })
        if (!laboratorio) {
            return res.status(404).json({ error: 'El laboratorio no existe' });
        }

        
        const nuevaIncidencia = await IncidenciaLab.create({
            id_laboratorio,
            incidencia,
            descripcion_incidencia
        });

        const user_PAS =  await Usuario.findByPk(id_user)

        console.log(id_user)
         console.log(user_PAS) 
        

         if (laboratorio.turno && laboratorio.turno.length > 0) {
            const emailPromises = laboratorio.turno
                .filter(turno => turno.profesor?.usuario?.email) // Filtra solo los que tienen email
                .map(turno => {
                    const profesorEmail = turno.profesor.usuario.email;
                    const profesorNombre = `${turno.profesor.usuario.FirstName} ${turno.profesor.usuario.LastName}`;
                    const nombrePas = `${user_PAS?.FirstName} ${user_PAS?.LastName}`;
                    const PASEmail = user_PAS?.email;
        
                    const mensaje = emailTemplate
                        .replace('${profesorNombre}', profesorNombre)
                        .replace(/\${nombrelab}/g, laboratorio.nombre_laboratorio) // Reemplaza todas las ocurrencias
                        .replace('${incidencia}', incidencia)
                        .replace('${nombrepas}', nombrePas)
                        .replace('${email}', PASEmail);
        
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: profesorEmail, // Aquí pones el email real del profesor
                        subject: 'Nueva incidencia registrada en el laboratorio',
                        html: mensaje,
                    };
        
                    return transporter.sendMail(mailOptions);
                });
        
           
            await Promise.all(emailPromises);
            console.log("Correos enviados a los profesores.");
    
            

         }
        
        
        res.status(201).json({
            message: "Incidencia registrada exitosamente.",
            incidencia: nuevaIncidencia,
          });
          
      
    
    } catch (error) {
        console.error('Error al registrar la incidencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});







router.get('/:id', authenticateToken, async (req, res) => {

    const {id} = req.params;
    
    try {
        const incidencias = await IncidenciaLab.findAll({
            where: { id_laboratorio: id },
            attributes: ['id_incidencia','incidencia', 'fecha_asociacion','descripcion_incidencia'],
        });
        console.log("incidencias Lab: " + JSON.stringify(incidencias, null, 2));
        res.status(200).json(incidencias);
    } catch (error) {
        console.error('Error al obtener incidencias del laboratorio:', error);
        res.status(500).json({ error: 'Error al obtener incidencias del laboratorio' });
    }

    
});

router.get('/', authenticateToken, async (req, res) => { 
    try {
        const incidencias = await IncidenciaLab.findAll({
            attributes: ['id_incidencia', 'id_laboratorio', 'incidencia', 'fecha_asociacion','descripcion_incidencia'],
            include: [
                {
                    model: Laboratorio,
                    as: "laboratorio",
                    attributes: ["nombre_laboratorio", "ubicacion"] 
                }
            ]
        });

        console.log("Todas las incidencias: " + JSON.stringify(incidencias, null, 2));
        res.status(200).json(incidencias);
    } catch (error) {
        console.error("Error al obtener todas las incidencias:", error);
        res.status(500).json({ error: "Error al obtener todas las incidencias" });
    }
});









module.exports = router;