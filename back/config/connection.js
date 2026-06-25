const { Sequelize } = require('sequelize');
require('dotenv').config();

// Crear una instancia de Sequelize para la conexión
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: 3306,
  dialect: 'mysql',
});

(async () => {
  sequelize.sync({ alter: true })
  .then(() => console.log("Base de datos sincronizada"))
  .catch(err => console.error("Error al sincronizar la base de datos", err));
  try {
    await sequelize.authenticate();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('La conexión a la base de datos se ha establecido correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
})();



module.exports = sequelize;


















 