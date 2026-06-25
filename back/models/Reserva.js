const DataTypes  = require('sequelize');
const sequelize = require('../config/connection');
const Alumno = require('./Alumno');
const Turno = require('./Turno');

const Reserva = sequelize.define('Reserva', {
    id_reserva: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_alumno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Alumno,
            key: 'id_alumno'
        }
    },
    id_turno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Turno,
            key: 'id_turno'
        }
    },
    fecha_reserva: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Aceptado" 
    }
}, {
    tableName: 'reserva',
    timestamps: false
});

// Relacionar Reserva con Usuario y Turno
Reserva.belongsTo(Alumno, { foreignKey: 'id_alumno', as: 'alumno' , onUpdate: 'CASCADE' });
Reserva.belongsTo(Turno, { foreignKey: 'id_turno', as: 'turno', onDelete: 'CASCADE', onUpdate: 'CASCADE', });
Alumno.hasMany(Reserva, { foreignKey: 'id_alumno', as: 'reservas' });
module.exports = Reserva;