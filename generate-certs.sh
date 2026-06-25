#!/usr/bin/env bash
set -e
mkdir -p certs

# Instala la CA local en el sistema y navegadores (solo la 1ª vez)
mkcert -install

# Certificado para el dominio y sus subdominios
mkcert -cert-file certs/upmlab.es.crt \
       -key-file  certs/upmlab.es.key \
       "upmlab.es" "*.upmlab.es"

echo "Certificados generados en ./certs"
