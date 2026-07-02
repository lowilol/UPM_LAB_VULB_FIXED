FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

# F-12: Ejecutar como usuario no privilegiado (node ya existe en la imagen base)
RUN chown -R node:node /app
USER node

EXPOSE 4000

CMD ["node", "app.js"]
