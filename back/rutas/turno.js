const express = require("express");
const router = express.Router();
const Turno = require("../models/Turno");
const Laboratorio = require("../models/Laboratorio");
const Profesor = require("../models/Profesor"); // Asegúrate de importar este modelo
const Usuario = require('../models/User');
const  Reserva =require('../models/Reserva');
const {isReservaMismoDia,calcularDiferenciaHoras,verificarConflictoHorario } = require ("../schema/turno")
const  Alumno  = require('../models/Alumno');
const { Op } = require("sequelize");
// F-04 / F-19: Proteger todas las rutas con autenticación JWT
const authenticateToken = require('../auth/authenticateToken');

const fs = require('fs');
const path = require('path');
const transporter = require('../config/email');

const ExcelJS = require("exceljs");


router.post('/', authenticateToken, async (req, res) => {
  const { id_laboratorio, fecha, hora_inicio, hora_fin,id_user} = req.body;
  console.log("Datos recibidos en el backend:", { id_laboratorio, id_user, fecha, hora_inicio, hora_fin });
  const id_profesor = id_user
  try {
    
    
    if (!id_profesor) {
      return res.status(401).json({ error: 'No autorizado. Profesor no identificado.' });
    }
    

    
    if (!id_laboratorio || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
   
    const fechaActual = new Date();
    const fechaTurno = new Date(fecha);

    
    fechaActual.setHours(0, 0, 0, 0);

    if (fechaTurno < fechaActual) {
      return res.status(400).json({ error: 'No se puede crear un turno en una fecha pasada.' });
    }
   
    if (isReservaMismoDia(fecha)) {
      const diferenciaHoras = calcularDiferenciaHoras(hora_inicio);
      if (diferenciaHoras < 4) {
        return res.status(400).json({ error: 'Reservas del mismo día requieren al menos 4 horas de anticipación.' });
      }
    }

    
    if (await verificarConflictoHorario(id_laboratorio, fecha, hora_inicio, hora_fin)) {
      return res.status(400).json({ error: 'Conflicto de horario detectado en el laboratorio.' });
    }

    
    const nuevoTurno = await Turno.create({
      id_laboratorio,
      id_profesor,
      fecha,
      hora_inicio,
      hora_fin,
    });

    return res.status(201).json({ message: 'Turno creado exitosamente.', turno: nuevoTurno });
  } catch (error) {
    console.error('Error al crear el turno:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// obtener  todos los turnos cualquiera
router.get("/", authenticateToken, async (req, res) => {
    try {
      const turnos = await Turno.findAll({
        include: [
          {
            model: Laboratorio,
            as: "laboratorio",
            attributes: ["nombre_laboratorio", "capacidad"],
          },
          {
            model: Profesor,
            as: "profesor",
            include: {
              model: Usuario ,
              as: "usuario",
              attributes: ["FirstName", "LastName"], 
            },
          },
        ],
      });
  
      res.status(200).json(turnos);
    } catch (error) {
      console.error("Error al obtener los turnos:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });

// obtener  todos los turnos del profesor
  router.get("/:id_profesor", authenticateToken, async (req, res) => {
    const { id_profesor } = req.params; 
  
    try {
      
      const turnos = await Turno.findAll({
        where: { id_profesor },
        include: [
          {
            model: Laboratorio,
            as: "laboratorio",
            attributes: ["nombre_laboratorio", "capacidad"],
          },
          {
            model: Profesor,
            as: "profesor",
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["FirstName", "LastName"],
              },
            ],
          },
        ],
      });
      if (turnos.length === 0) {
        return res.status(404).json({ message: "No se encontraron turnos para el profesor especificado." });
      }
  
      res.status(200).json(turnos);
    } catch (error) {
      console.error("Error al obtener los turnos:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });

  

// Borrar turno 
  router.delete("/:id_profesor/:id_turno", authenticateToken, async (req, res) => {
    const { id_profesor, id_turno } = req.params; 
    const emailTemplatePath = path.join(__dirname, '../templates/email_incidenciaCancelar_turno.html');
    let emailTemplate = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' });

    try {
        // Buscar el turno con los detalles del profesor
        const turno = await Turno.findOne({
            where: {
                id_turno,
                id_profesor,
            },
            include: [
                {
                    model: Profesor,
                    as: 'profesor',
                    include: [
                        {
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['FirstName', 'LastName', 'email'], // Datos del profesor
                        },
                    ],
                },
            ],
        });

        if (!turno) {
            return res.status(404).json({ error: "Turno no encontrado o no pertenece al profesor." });
        }

        
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
                            attributes: ['FirstName', 'LastName', 'email'], // Datos del alumno
                        },
                    ],
                },
            ],
        });

        
        await turno.destroy();

        
        for (const reserva of reservas) {
            const alumnoEmail = reserva?.alumno?.usuario?.email;
            const alumnoNombre = `${reserva?.alumno?.usuario?.FirstName} ${reserva?.alumno?.usuario?.LastName}`;
            const profesorNombre = `${turno.profesor?.usuario?.FirstName} ${turno.profesor?.usuario?.LastName}`;
            const profesorEmail = turno.profesor?.usuario?.email;

            if (alumnoEmail) {
                const mensaje = emailTemplate
                    .replace('${alumnoNombre}', alumnoNombre)
                    .replace('${fecha}', turno.fecha)
                    .replace('${hora_inicio}', turno.hora_inicio)
                    .replace('${hora_fin}', turno.hora_fin)
                    .replace('${incidencia}', 'Turno cancelado.')
                    .replace('${email}', profesorEmail)
                    .replace('${profesor}', profesorNombre);

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: alumnoEmail,
                    subject: 'Notificación de Cancelación de Turno',
                    html: mensaje,
                };

                await transporter.sendMail(mailOptions);
                
            }
        }
        await Reserva.destroy({ where: { id_turno } });
      res.status(200).json({ message: "Turno eliminado exitosamente." });
      
    } catch (error) {
      console.error("Error al eliminar el turno:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });

// actualizar turno 
router.put("/:id_profesor/:id_turno", authenticateToken, async (req, res) => {
  const { id_profesor, id_turno } = req.params;
  const { fecha, hora_inicio, hora_fin } = req.body;

  try {
      
    const turno = await Turno.findOne({
      where: {
          id_turno,
          id_profesor,
      },
      include: [
          {
              model: Profesor,
              as: 'profesor',
              include: [
                  {
                      model: Usuario,
                      as: 'usuario',
                      attributes: ['FirstName', 'LastName', 'email'], // Datos del profesor
                  },
              ],
          },
      ],
  });

      if (!turno) {
          return res.status(404).json({ error: "Turno no encontrado o no pertenece al profesor." });
      }

      
      const updates = {};
      if (fecha) updates.fecha = fecha;
      if (hora_inicio) updates.hora_inicio = hora_inicio;
      if (hora_fin) updates.hora_fin = hora_fin;

      
      if (updates.fecha || updates.hora_inicio || updates.hora_fin) {
          const conflict = await Turno.findOne({
              where: {
                  id_profesor,
                  id_turno: { [Op.ne]: id_turno },
                  fecha: updates.fecha || turno.fecha,
                  [Op.or]: [
                      {
                          hora_inicio: { [Op.lt]: updates.hora_fin || turno.hora_fin },
                          hora_fin: { [Op.gt]: updates.hora_inicio || turno.hora_inicio },
                      },
                  ],
              },
          });

          if (conflict) {
              return res.status(400).json({ error: "Conflicto detectado con otro turno." });
          }
      }

      
      await turno.update(updates);


      

    if (!turno) {
        return res.status(404).json({ error: "Turno no encontrado o no pertenece al profesor." });
    }


      
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
                attributes: ['FirstName', 'LastName', 'email'],
              },
            ],
          },
        ],
      });

      // Leer la plantilla de correo
      const emailTemplatePath = path.join(__dirname, '../templates/email_turno_actualizado.html');
      const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

      
      for (const reserva of reservas) {
          
          const alumnoEmail = reserva?.alumno?.usuario?.email;
            const alumnoNombre = `${reserva?.alumno?.usuario?.FirstName} ${reserva?.alumno?.usuario?.LastName}`;
            const profesorNombre = `${turno.profesor?.usuario?.FirstName} ${turno.profesor?.usuario?.LastName}`;
            const profesorEmail = turno.profesor?.usuario?.email;
          const emailContent = emailTemplate
              .replace(/{{nombre}}/g, alumnoNombre )
              .replace(/{{fecha}}/g, updates.fecha )
              .replace(/{{hora_inicio}}/g, updates.hora_inicio )
              .replace(/{{hora_fin}}/g, updates.hora_fin ).
              replace(/{{emailProfesor}}/g, profesorEmail ).
              replace(/{{profesor}}/g, profesorNombre);
          const mailOptions = {
              from: process.env.EMAIL_USER, 
              to: alumnoEmail, 
              subject: 'Actualización de Turno', 
              html: emailContent, 
          };
  
          await transporter.sendMail(mailOptions);
      }
        console.log("actualización realizada exitosamente")
      return res.status(200).json({message:"actualización realizada exitosamente" });
  } catch (error) {
      console.error("Error al actualizar el turno:", error);
      res.status(500).json({ error: "Error interno del servidor." });
  }
});




// F-19: Requiere autenticación y rol Profesor o PAS para evitar IDOR
router.get("/exportar-alumnos/:id_turno", authenticateToken, async (req, res) => {
  const { id_turno } = req.params;

  // RBAC: solo Profesor y PAS pueden exportar listas de alumnos
  const rolesPermitidos = ['Profesor', 'PAS', 'Admin'];
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol Profesor o PAS.' });
  }

  try {
    const reservas = await Reserva.findAll({
      where: { id_turno },
      attributes: ['id_reserva', 'estado'],
      include: [
        {
          model: Alumno,
          as: 'alumno',

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
    console.log("reservaaaaaaaaaaaas:"+reservas)
    if (!reservas.length) {
      return res.status(404).json({ error: "No hay alumnos reservados para este turno." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Lista de Alumnos");


    worksheet.columns = [
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Apellido", key: "apellido", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Reserva:", key: "estado", width: 15 }
    ];


    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };  
      cell.fill = {                                                     
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "007BFF" }
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };      
      cell.border = {                                                    
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });


    reservas.forEach((reserva) => {
      const row = worksheet.addRow({
        nombre: reserva?.alumno?.usuario?.FirstName || "N/A",
        apellido: reserva?.alumno?.usuario?.LastName || "N/A",
        email: reserva?.alumno?.usuario?.email || "N/A",
        estado: reserva.estado || "N/A",


        
      });


      const estadoCell = row.getCell('estado');

      if (reserva?.estado === 'Aceptado') {
          estadoCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'C6EFCE' },  
          };
          estadoCell.font = { color: { argb: '006100' }, bold: true }; 
      } else if (reserva?.estado === 'Cancelado') {
          estadoCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC7CE' }, 
          };
          estadoCell.font = { color: { argb: '9C0006' }, bold: true }; 
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };  
    });


   



    worksheet.eachRow({ includeEmpty: true }, function (row) {
      row.height = 20;
    });
  });




    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=Lista_Alumnos_Turno_${id_turno}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

  





