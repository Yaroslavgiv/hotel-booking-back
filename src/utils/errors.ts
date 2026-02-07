import { GraphQLError, GraphQLFormattedError } from 'graphql';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Совместимо с сигнатурой Apollo Server v4:
// (formattedError: GraphQLFormattedError, error: unknown) => GraphQLFormattedError
export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  const graphQLError = error instanceof GraphQLError ? error : undefined;
  const originalError = graphQLError?.originalError;

  if (originalError instanceof ValidationError) {
    return {
      ...formattedError,
      message: originalError.message,
      extensions: {
        ...formattedError.extensions,
        code: 'VALIDATION_ERROR',
      },
    };
  }

  if (originalError instanceof ConflictError) {
    return {
      ...formattedError,
      message: originalError.message,
      extensions: {
        ...formattedError.extensions,
        code: 'CONFLICT_ERROR',
      },
    };
  }

  if (originalError instanceof NotFoundError) {
    return {
      ...formattedError,
      message: originalError.message,
      extensions: {
        ...formattedError.extensions,
        code: 'NOT_FOUND',
      },
    };
  }

  return formattedError;
}
