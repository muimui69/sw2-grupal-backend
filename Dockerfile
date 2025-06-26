# Etapa de desarrollo
FROM node:22-alpine AS development

# Instala pnpm globalmente
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copia los archivos necesarios para instalación de dependencias
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias (todas)
RUN pnpm install

# Copia el resto del código fuente
COPY . .

# Construye la aplicación
RUN pnpm run build

# Etapa de producción
FROM node:22-alpine AS production

RUN npm install -g pnpm

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

# Instala solo dependencias de producción
RUN pnpm install --prod

# Copia la app compilada desde el stage de desarrollo
COPY --from=development /usr/src/app/dist ./dist

USER node

CMD ["node", "dist/main"]