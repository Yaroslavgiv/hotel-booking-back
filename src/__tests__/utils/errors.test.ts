import { ValidationError, ConflictError, NotFoundError, formatError } from '../../utils/errors';
import { GraphQLError } from 'graphql';

describe('Errors', () => {
  describe('ValidationError', () => {
    it('должен создать ошибку валидации с правильным именем', () => {
      const error = new ValidationError('Тестовое сообщение');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Тестовое сообщение');
    });
  });

  describe('ConflictError', () => {
    it('должен создать ошибку конфликта с правильным именем', () => {
      const error = new ConflictError('Тестовое сообщение');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ConflictError');
      expect(error.message).toBe('Тестовое сообщение');
    });
  });

  describe('NotFoundError', () => {
    it('должен создать ошибку "не найдено" с правильным именем', () => {
      const error = new NotFoundError('Тестовое сообщение');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Тестовое сообщение');
    });
  });

  describe('formatError', () => {
    it('должен форматировать ValidationError с кодом VALIDATION_ERROR', () => {
      const validationError = new ValidationError('Ошибка валидации');
      const graphQLError = new GraphQLError('Ошибка', {
        originalError: validationError,
      });

      const formattedError = {
        message: 'Ошибка',
        extensions: {},
      };

      const result = formatError(formattedError, graphQLError);

      expect(result.message).toBe('Ошибка валидации');
      expect(result.extensions?.code).toBe('VALIDATION_ERROR');
    });

    it('должен форматировать ConflictError с кодом CONFLICT_ERROR', () => {
      const conflictError = new ConflictError('Конфликт');
      const graphQLError = new GraphQLError('Ошибка', {
        originalError: conflictError,
      });

      const formattedError = {
        message: 'Ошибка',
        extensions: {},
      };

      const result = formatError(formattedError, graphQLError);

      expect(result.message).toBe('Конфликт');
      expect(result.extensions?.code).toBe('CONFLICT_ERROR');
    });

    it('должен форматировать NotFoundError с кодом NOT_FOUND', () => {
      const notFoundError = new NotFoundError('Не найдено');
      const graphQLError = new GraphQLError('Ошибка', {
        originalError: notFoundError,
      });

      const formattedError = {
        message: 'Ошибка',
        extensions: {},
      };

      const result = formatError(formattedError, graphQLError);

      expect(result.message).toBe('Не найдено');
      expect(result.extensions?.code).toBe('NOT_FOUND');
    });

    it('должен вернуть исходную ошибку для неизвестных типов', () => {
      const unknownError = new Error('Неизвестная ошибка');
      const graphQLError = new GraphQLError('Ошибка', {
        originalError: unknownError,
      });

      const formattedError = {
        message: 'Ошибка',
        extensions: { code: 'UNKNOWN' },
      };

      const result = formatError(formattedError, graphQLError);

      expect(result).toEqual(formattedError);
    });

    it('должен обработать ошибку, которая не является GraphQLError', () => {
      const formattedError = {
        message: 'Ошибка',
        extensions: {},
      };

      const result = formatError(formattedError, new Error('Простая ошибка'));

      expect(result).toEqual(formattedError);
    });
  });
});
