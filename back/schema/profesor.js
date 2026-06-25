const verificarConflictoHorario = async (id_laboratorio, fecha, hora_inicio, hora_fin) => {
    const conflictos = await Turno.findOne({
      where: {
        id_laboratorio,
        fecha,
        [Op.or]: [
          {
            hora_inicio: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            hora_fin: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            [Op.and]: [
              {
                hora_inicio: {
                  [Op.lte]: hora_inicio,
                },
              },
              {
                hora_fin: {
                  [Op.gte]: hora_fin,
                },
              },
            ],
          },
        ],
      },
    });
  
    return !!conflictos; // Retorna true si hay conflictos
  };
  module.exports = verificarConflictoHorario;