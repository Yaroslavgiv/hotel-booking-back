FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости для сборки better-sqlite3 и healthcheck
RUN apk add --no-cache python3 make g++ wget

# Копируем файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Удаляем dev зависимости и кэш npm
RUN npm prune --production && npm cache clean --force

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Открываем порт
EXPOSE 4001

# Запускаем приложение
CMD ["npm", "start"]
