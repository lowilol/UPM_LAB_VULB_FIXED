const { crearUsuario,Rol_,extraerDominioCorreo} = require("../schema/user");
const express = require("express");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();
const { verifyCode,verifyCodeDestroy } = require("../auth/verify");

// F-11: Rate limiting en memoria — máx 5 intentos por IP+email en 15 minutos
const WINDOW_MS  = 15 * 60 * 1000; // 15 minutos
const MAX_INTENTOS = 5;
const intentos = new Map(); // clave: "ip:email" → { count, resetAt }

function obtenerClave(req, email) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return `${ip}:${email}`;
}

function checkRateLimit(req, email) {
  const clave = obtenerClave(req, email);
  const ahora = Date.now();
  const entrada = intentos.get(clave);

  if (!entrada || ahora > entrada.resetAt) {
    intentos.set(clave, { count: 1, resetAt: ahora + WINDOW_MS });
    return null; // permitido
  }
  if (entrada.count >= MAX_INTENTOS) {
    const segundosRestantes = Math.ceil((entrada.resetAt - ahora) / 1000);
    return segundosRestantes;
  }
  entrada.count += 1;
  return null; // permitido
}

function resetearClave(req, email) {
  intentos.delete(obtenerClave(req, email));
}

router.post("/", async function (req, res) {
    const { email, verificationCode, name, lastname, password } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json(jsonResponse(400, { error: "email y verificationCode son requeridos." }));
    }

    // F-11: Comprobar rate limit antes de procesar
    const bloqueado = checkRateLimit(req, email);
    if (bloqueado !== null) {
      return res.status(429).json(jsonResponse(429, {
        error: `Demasiados intentos. Inténtalo de nuevo en ${bloqueado} segundos.`
      }));
    }

    const dominio = await extraerDominioCorreo(email);
    let rol = Rol_(dominio);

    try {
      const isCodeValid = await verifyCode(email, verificationCode);
      if (isCodeValid) {
        resetearClave(req, email); // éxito → liberar el contador
        await crearUsuario(lastname, password, name, email, rol);
        await verifyCodeDestroy(email);
        res.status(200).json({ message: "Usuario creado exitosamente." });
      } else {
        res.status(400).json(jsonResponse(400, { error: "Código de verificación inválido." }));
      }
    } catch (err) {
      return res.status(500).json(jsonResponse(500, { error: "Error al crear el usuario." }));
    }
  });

  module.exports = router;