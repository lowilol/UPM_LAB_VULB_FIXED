const express = require('express');
const router = express.Router();
const  Turno  =require('../models/Turno');
const  Reserva =require('../models/Reserva');
const  Laboratorio  =require('../models/Laboratorio');
const { jsonResponse } = require("../lib/jsonResponse");

router.post('/:id_turno/:id_alumno', async (req, res) => {
    const { id_turno, id_alumno } = req.params;

    try {
        // Verificar si ya existe la reserva
        const existingReserva = await Reserva.findOne({ where: { id_turno, id_alumno } });
        console.log("alumnoooo: " + id_alumno +" " + id_turno)
        if (existingReserva) {
            const mensajes = {
                Aceptado: "La reserva ya existe.",
                Cancelada: "Reserva cancelada, no puede volver a reservar."
            };

            return res.status(400).json({ error: mensajes[existingReserva.estado] || 'Error inesperado.' });
        }


       
            
            const turno = await Turno.findByPk(id_turno);
            if (!turno) {
                return res.status(400).json({ error: "Turno asociado no encontrado" });
            }

            if (turno.capacidad_ocupada >= turno.capacidad) {
                return res.status(400).json({ error: "El turno ya está completo." });
            }

            
            await Reserva.create(
                { id_turno: id_turno, id_alumno: id_alumno,  fecha_reserva: new Date(), estado: "Aceptado" },
                
            );

            
            turno.capacidad_ocupada += 1;
            await turno.save(); 
           
         
            
            return res.status(201).json({ message: 'ha sido exitoso al crear la reserva.' });
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        res.status(500).json({ message: 'Error al crear la reserva.' });
    }
});

router.put("/cancelar/:id_turno/:id_alumno", async (req, res) => {
  const { id_alumno,id_turno } = req.params;
  console.log("alumnoooo: " + id_alumno +" " + id_turno)
    try {
      
      const reserva = await Reserva.findOne({
        where: {
           id_turno,
           id_alumno
        }
      });

      console.log(reserva)
      if (!reserva) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }
  
      if(reserva.estado === "Cancelada"){
       

        return res.status(409).json(
            jsonResponse(409, {
              error: "Reserva ya ha sido cancelada",
            })
          );
      }
      const turno = await Turno.findByPk(id_turno);
      if (!turno) {
        return res.status(404).json({ error: "Turno asociado no encontrado" });
      }



    const fechaHoraTurno = new Date(`${turno.fecha}T${turno.hora_inicio}`);
    const ahora = new Date();
    const diferenciaHoras = (fechaHoraTurno - ahora) / (1000 * 60 * 60); // Diferencia en horas

    if (diferenciaHoras < 1) {
      return res.status(400).json({ error: 'No se puede cancelar la reserva con menos de 1 hora de anticipación.' });
    }



  
     
      reserva.estado = "Cancelada";
      await reserva.save();
  
     
      turno.capacidad_ocupada = Math.max(0, turno.capacidad_ocupada - 1); // Asegura que no sea menor a 0
      await turno.save();
  
      res.json({ message: "Reserva cancelada exitosamente", reserva, turno });
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  


router.get('/:id_alumno', async (req, res) => {
   try {
       const { id_alumno } = req.params;

       const reservas = await Reserva.findAll({
           where: { id_alumno },
           include: [
               {
                   model: Turno,
                   as: 'turno',
                   include: [
                       {
                           model: Laboratorio,
                           as: 'laboratorio',
                       },
                   ],
               },
           ],
       });

       if (reservas.length === 0) {
           return res.status(404).json({ message: 'No se encontraron reservas para este alumno.' });
       }

       res.json(reservas);
   } catch (error) {
       console.error('Error al obtener reservas:', error);
       res.status(500).json({ message: 'Error interno del servidor.' });
   }
});
module.exports = router;