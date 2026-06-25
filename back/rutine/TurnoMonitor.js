const cron = require('node-cron');
const { Op } = require('sequelize');
const Turno = require('../models/Turno'); 

cron.schedule('* * * * *', async () => { 
  try {
    const ahora = new Date();
    console.log(ahora)
    console.log(ahora.toTimeString().split(' ')[0])
    console.log(ahora.toISOString().split('T')[0])
    const turnosFinalizados = await Turno.findAll({
      where: {
        hora_fin: { [Op.lt]: ahora.toTimeString().split(' ')[0] },
        fecha: { [Op.lte]: ahora.toISOString().split('T')[0] },
        estado: { [Op.ne]: 'Finalizado' }
      }
    });
    console.log(turnosFinalizados)
    for (const turno of turnosFinalizados) {
      turno.estado = 'Finalizado';
      await turno.save();
    }

    console.log(`Se actualizaron ${turnosFinalizados.length} turnos como "Finalizado".`);
  } catch (error) {
    console.error('Error al actualizar turnos finalizados:', error);
  }
});