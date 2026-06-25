const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require("cookie-parser");
const session = require('express-session');
require('./rutine/TurnoMonitor');
require('@dotenvx/dotenvx').config({ path: require('path').resolve(__dirname, '../.env') });


const port = process.env.PORT || 4000;


app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.1.150','http://192.168.1.150'], credentials: true ,}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
      secure: false, 
      sameSite: 'lax', 
    },
  })
);


app.use("/api/signup",require("./rutas/signup"));
app.use("/api/login",require("./rutas/login"));
app.use("/api/user",require("./rutas/user"));

app.use("/api/requestPasswordReset",require("./rutas/RequestChangePasswordEmail"));
app.use("/api/resetPassword",require("./rutas/passwordChanger"));
app.use("/api/verifyCode",require("./rutas/verifyCode"));
app.use("/api/dashboard",require("./rutas/dashboard"));
app.use("/api/laboratorio",require("./rutas/laboratorio"));
app.use("/api/turno",require("./rutas/turno"));
app.use("/api/reserva",require("./rutas/reserva"));
app.use("/api/reserva/cancelar",require("./rutas/reserva"));



app.use("/api/incidencia/turno",require("./rutas/incidencia_turno"))
app.use("/api/incidencia/laboratorio",require("./rutas/incidencia_lab"))

app.use("/api/user",require("./rutas/user"));
app.use("/api/verifyToken",require("./rutas/verifyToken"));
app.use("/api/logout",require("./rutas/logout"));


app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto  http://127.0.0.1:${port}/`)})