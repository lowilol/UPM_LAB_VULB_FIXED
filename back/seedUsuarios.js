// back/seedUsuarios.js
// Ejecutar desde back/:  npx @dotenvx/dotenvx run --env-file=.env -- node seedUsuarios.js
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

// Conexión propia SIN sync automático (no importamos ./config/connection)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { host: process.env.DB_HOST, port: 3306, dialect: "mysql", logging: false }
);

// Modelos mínimos que reflejan las tablas existentes (sin tocar el esquema)
const User = sequelize.define("User", {
  id_user:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email:     { type: DataTypes.STRING, allowNull: false },
  FirstName: { type: DataTypes.STRING, allowNull: false },
  LastName:  { type: DataTypes.STRING, allowNull: false },
  rol:       { type: DataTypes.STRING, allowNull: false },
  password:  { type: DataTypes.STRING, allowNull: false },
}, { tableName: "usuario", timestamps: false });

const Profesor = sequelize.define("Profesor", {
  id_profesor: { type: DataTypes.INTEGER, primaryKey: true },
  id_user:     { type: DataTypes.INTEGER, allowNull: false },
  departamento:{ type: DataTypes.STRING, allowNull: true },
}, { tableName: "profesor", timestamps: false });

const Alumno = sequelize.define("Alumno", {
  id_alumno: { type: DataTypes.INTEGER, primaryKey: true },
  id_user:   { type: DataTypes.INTEGER, allowNull: false },
  matricula: { type: DataTypes.STRING, allowNull: true },
}, { tableName: "alumno", timestamps: false });

const usuarios = [
  { email: "profesor.demo@upm.es", FirstName: "Ana",   LastName: "García",   rol: "Profesor", password: "Profesor123", departamento: "Informática" },
  { email: "pas.demo@upm.es",      FirstName: "Luis",  LastName: "Martínez", rol: "PAS",      password: "Pas123" },
  { email: "alumno.demo@alumnos.upm.es", FirstName: "Juan", LastName: "Pérez", rol: "Alumno", password: "Alumno123", matricula: "A2026001" },
];

async function seed() {
  try {
    await sequelize.authenticate();      // solo conecta; NO sincroniza

    for (const u of usuarios) {
      const existe = await User.findOne({ where: { email: u.email } });
      if (existe) { console.log(`Saltado (ya existe): ${u.email}`); continue; }

      const nuevoUsuario = await User.create({
        email: u.email,
        FirstName: u.FirstName,
        LastName: u.LastName,
        rol: u.rol,
        password: await bcrypt.hash(u.password, 10),
      });

      if (u.rol === "Profesor") {
        await Profesor.create({
          id_profesor: nuevoUsuario.id_user,
          id_user: nuevoUsuario.id_user,
          departamento: u.departamento ?? null,
        });
      }

      if (u.rol === "Alumno") {
        await Alumno.create({
          id_alumno: nuevoUsuario.id_user,
          id_user: nuevoUsuario.id_user,
          matricula: u.matricula ?? null,
        });
      }

      console.log(`Creado ${u.rol}: ${u.email} (id_user=${nuevoUsuario.id_user})`);
    }

    console.log("Seed completado.");
  } catch (error) {
    console.error("Error en el seed:", error.parent?.sqlMessage || error.message);
  } finally {
    await sequelize.close();   // aquí sí es seguro: nadie más usa esta conexión
  }
}

seed();