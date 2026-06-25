const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Turno = require("./Turno")


const Incidencia_turno = sequelize.define('incidencia_turno', {
    id_incidencia: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    
    id_turno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Turno,
            key: 'id_turno'
        }
    },
    fecha_asociacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW 
    },
    incidencia: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    descripcion_incidencia: {
        type: DataTypes.STRING(255), 
        allowNull: true
    },
}, {
    tableName: 'incidencia_turno',
    timestamps: false
});



Incidencia_turno .belongsTo(Turno, { foreignKey: 'id_turno', as: 'turno' ,onDelete: 'CASCADE'});
module.exports = Incidencia_turno ;