
const sequelize = require('../config/connection');
const Laboratorio = require('./Laboratorio');
const IncidenciaLab = require('./Incidencia_lab');


const IncidenciaLTurno = require('./Incidencia_lab');

const Usuario = require('./User');
const Turno = require('./Turno');
const Reserva = require('./Reserva');
const Alumno = require('./Alumno');

/* relación turno - reserva */


/* relación reserva - alumno */
Reserva.belongsTo(Alumno, { foreignKey: "id_alumno", as: "alumno" , onUpdate: 'CASCADE'});

/* relación usuario - reserva */
Usuario.hasMany(Reserva, { foreignKey: "id_user", as: "reservas" , onUpdate: 'CASCADE'});

/* relación incidencia laboratorio */
IncidenciaLab.belongsTo(Laboratorio, { foreignKey: "id_laboratorio", as: "laboratorio" });
Laboratorio.hasMany(IncidenciaLab, { foreignKey: "id_laboratorio", as: "incidencias" });

IncidenciaLTurno.belongsToMany(Turno, {
    foreignKey: 'id_incidencia',
    otherKey: 'id_laboratorio',
    as: 'laboratorio'
});

Turno.belongsToMany(IncidenciaLTurno, {
    foreignKey: 'id_laboratorio',
    otherKey: 'id_incidencia',
    as: 'incidencia'
});




    sequelize.sync({ force: false }) 
    .then(() => {
        console.log('Modelos sincronizados correctamente.');
    })
    .catch(error => {
        console.error('Error al sincronizar los modelos:', error);
    });

   module.exports = { Laboratorio, Usuario, Turno, Reserva, IncidenciaLab }
    