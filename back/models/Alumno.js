const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Usuario = require('./User');


const Alumno = sequelize.define('Alumno', {
    id_alumno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Usuario,
            key: 'id_user'
        }
    },
    matricula: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'alumno',
    timestamps: false
})


Usuario.hasOne(Alumno, { foreignKey: 'id_user', as: 'alumno' });
Alumno.belongsTo(Usuario, { foreignKey: 'id_user', as: 'usuario' });


module.exports = Alumno;