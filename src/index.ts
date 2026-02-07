import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { AppDataSource } from './database/dataSource';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { formatError } from './utils/errors';
import { logger } from './utils/logger';
import { seed } from './database/seed';

const PORT = process.env.PORT || 4001;

async function startServer() {
  try {
    // Инициализация базы данных
    await AppDataSource.initialize();
    logger.info('База данных подключена');

    // Заполнение начальными данными
    await seed();
    logger.info('Начальные данные загружены');

    // Создание Express приложения
    const app = express();

    // Создание Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      formatError,
    });

    await server.start();

    app.use('/graphql', express.json(), expressMiddleware(server));

    // Запуск сервера
    app.listen(PORT, () => {
      logger.info(`🚀 Сервер запущен на http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    logger.error('Ошибка при запуске сервера', error);
    process.exit(1);
  }
}

startServer();
