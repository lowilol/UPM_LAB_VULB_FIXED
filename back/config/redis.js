const Redis = require("ioredis");

require('dotenv').config();
const redis = new Redis({
  host: process.env.REDIS_HOST, 
  port: 6379,        
  db: 0,             
});

redis.on("connect", () => console.log(" Conectado a Redis"));
redis.on("error", (err) => console.error(" Error en Redis:", err));

module.exports = redis;
