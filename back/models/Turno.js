const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Laboratorio = require('./Laboratorio'); 
const Profesor = require('./Profesor');
const Turno = sequelize.define('Turno', {
    id_turno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_laboratorio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Laboratorio,
            key: 'id_laboratorio'
        }
    },
    id_profesor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Profesor,
            key: 'id_profesor'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    capacidad_ocupada: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Valor por defecto
    },
     estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Activo" 
        }
}, {
    tableName: 'turno',
    timestamps: false
});

Turno.belongsTo(Laboratorio, { foreignKey: "id_laboratorio", as: "laboratorio" });
Laboratorio.hasMany(Turno, { 
    foreignKey: "id_laboratorio",
    as: "turno", 
    onDelete: "CASCADE",
});
Turno.belongsTo(Profesor, { foreignKey: 'id_profesor', as: 'profesor' });

module.exports = Turno;