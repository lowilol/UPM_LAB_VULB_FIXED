const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const User =  sequelize.define('User', {
  id_user: {
    type: DataTypes.INTEGER,
    autoIncrement: true, 
    primaryKey: true,    
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
    
  },
  FirstName: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  LastName: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
}, {
  
  
    tableName: 'usuario', // Nombre de la tabla en la base de datos
    timestamps: false,  // Desactiva las columnas createdAt y updatedAt
});



 


module.exports = User;