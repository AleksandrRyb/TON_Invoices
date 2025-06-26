# Используем официальный Node.js образ
FROM node:22-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production=false

# Копируем исходный код
COPY . .

# По умолчанию dev-режим
ENV NODE_ENV=development

EXPOSE 8000
