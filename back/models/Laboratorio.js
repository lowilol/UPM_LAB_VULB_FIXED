const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Laboratorio = sequelize.define('Laboratorio', {
    id_laboratorio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_laboratorio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ubicacion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    deshabilitado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    
}, {
    tableName: 'laboratorio'
});



module.exports = Laboratorio;