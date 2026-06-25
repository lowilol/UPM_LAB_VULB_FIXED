
const Turno = require("../models/Turno");

const { Op } = require("sequelize");


function isReservaMismoDia(fecha) {
    const fechaActual = new Date().toISOString().split("T")[0];
    return fecha === fechaActual;
  }
  
  
function calcularDiferenciaHoras(horaInicio) {
    const [horaInicioH, horaInicioM] = horaInicio.split(":").map(Number);
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActual = ahora.getMinutes();
    const diferenciaMinutos = (horaInicioH * 60 + horaInicioM) - (horaActual * 60 + minutosActual);
    return diferenciaMinutos / 60; 
  }
  
  
async function verificarConflictoHorario(id_laboratorio, fecha, hora_inicio, hora_fin) {
    const turnos = await Turno.findAll({
      where: {
        id_laboratorio,
        fecha,
        [Op.or]: [
          {
            hora_inicio: { [Op.lt]: hora_fin }, 
            hora_fin: { [Op.gt]: hora_inicio }, 
          },
        ],
      },
    });
  
    return turnos.length > 0; 
  }


  module.exports = {
    isReservaMismoDia,
    calcularDiferenciaHoras,
    verificarConflictoHorario,
  };