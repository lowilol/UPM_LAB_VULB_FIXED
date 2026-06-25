const express = require('express');
const router = express.Router();
// F-03: Proteger todas las rutas de incidencias de turno
const authenticateToken = require('../auth/authenticateToken');

const  IncidenciaTurno  = require('../models/Incidencia_turno');
const   Turno  = require('../models/Turno');
const  Reserva= require('../models/Reserva');
const  Usuario  = require('../models/User');

const  Alumno  = require('../models/Alumno');
const  Profesor  = require('../models/Profesor');

const fs = require('fs');
const path = require('path');

const transporter = require('../config/email'); 






router.delete('/:id_incidencia', authenticateToken, async (req, res) => {
    const { id_incidencia} = req.params;
  
    try {
      const incidencia = await IncidenciaTurno.findByPk(id_incidencia);
      
  
      if (!incidencia) {
        return res.status(404).json({ error: 'Laboratorio no encontrado' });
      }
  
      await IncidenciaTurno.destroy({ where: { id_incidencia } });
     
      res.status(200).json({ message: 'inicidencia eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el laboratorio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });






router.get('/:id', authenticateToken, async (req, res) => {
    const {id} = req.params;
    console.log("estoy en el get de turno "+ JSON.stringify(id, null, 2))
    
    try {
        const incidencias = await IncidenciaTurno.findAll({
            where: { id_turno: id },
            attributes: ['id_incidencia','incidencia', 'fecha_asociacion','descripcion_incidencia'], 
           
        });
        console.log("incidencias turno: "+JSON.stringify(incidencias, null, 2));
        res.status(200).json(incidencias);
        console.log("a")
    } catch (error) {
        console.error('Error al obtener incidencias del turno:', error);
        res.status(500).json({ error: 'Error al obtener incidencias del turno' });
    }


});










router.post('/', authenticateToken, async (req, res) => {
    const { id_turno, incidencia , descripcion_incidencia} = req.body;
    const emailTemplatePath = path.join(__dirname, '../templates/email_incidencia_turno.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' });

    try {
        
        


        const turno  = await Turno.findOne({
            where: { id_turno },
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
        });
        if (!turno) {
            return res.status(404).json({ error: 'El turno no existe' });
        }

         console.log(turno)

         console.log(JSON.stringify(turno, null, 2));
        const nuevaIncidencia = await IncidenciaTurno.create({
            id_turno,
            incidencia,
            descripcion_incidencia
        });

        
        const reservas = await Reserva.findAll({
            where: { id_turno },
            include: [
                {
                    model: Alumno,
                    as: 'alumno',
                    include: [
                        {
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['FirstName', 'LastName', 'email'], // Datos del usuario
                        },
                    ],
                },
                
            ],
        });
        
        const emailProfesor = turno?.profesor?.usuario?.email
        const NombreProfesor = `${turno?.profesor?.usuario?.FirstName} ${turno?.profesor?.usuario?.LastName}`;
        console.log(JSON.stringify(reservas, null, 2));

        console.log(emailProfesor);
        for (const reserva of reservas) {
            
            const emailAlumno = reserva?.alumno?.usuario?.email;
            const NombreAlumno = `${reserva?.alumno?.usuario?.FirstName} ${reserva?.alumno?.usuario?.LastName}`;
            const asunto = 'Incidencia de turno';
            emailTemplate = emailTemplate.replace('${incidencia}', incidencia);
            emailTemplate = emailTemplate.replace('${alumnoNombre}', NombreAlumno );
            emailTemplate = emailTemplate.replace('${fecha}',turno.fecha );
            emailTemplate = emailTemplate.replace('${hora_inicio}',turno.hora_inicio );
            emailTemplate = emailTemplate.replace('${hora_fin}',turno.hora_fin );

            emailTemplate = emailTemplate.replace('${profesor}',NombreProfesor );
            emailTemplate = emailTemplate.replace('${email}',emailProfesor  );
            const mailOptions ={
                from: process.env.EMAIL_USER,
                to: emailAlumno ,
                subject: asunto ,
                html:emailTemplate,
              }

            transporter.sendMail(mailOptions);
        }

        res.status(201).json({ message: 'Incidencia registrada y correos enviados.', incidencia: nuevaIncidencia });
    } catch (error) {
        console.error('Error al registrar la incidencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
module.exports = router;