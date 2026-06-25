const { Model, DataTypes } = require("sequelize");
const sequelize = require('../config/connection');
// hacer microservicio para un futuro
class VerificationCode extends Model {}

VerificationCode.init({
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, { sequelize, modelName: "verification_code" });

module.exports = VerificationCode;