const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Laboratorio = require('./Laboratorio');

const Incidencia_lab= sequelize.define('LaboratorioIncidencia', {
    
    id_incidencia: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        
    },
    id_laboratorio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Laboratorio,
            key: 'id_laboratorio'
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
    tableName: 'incidencia_laboratorio',
    timestamps: false
});


Incidencia_lab.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio', as: 'laboratorio',onDelete: 'CASCADE' });

module.exports = Incidencia_lab;