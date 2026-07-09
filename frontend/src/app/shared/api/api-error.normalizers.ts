import { HttpErrorResponse } from '@angular/common/http';

import type { ApiError, ApiErrorResponse, NormalizedApiErrorOptions } from './api-error.model';
import { NormalizedApiError } from './api-error.model';

const FALLBACK_ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Nao foi possivel comunicar com a API.',
  BAD_REQUEST: 'A requisicao enviada nao pode ser processada.',
  UNAUTHORIZED: 'Voce precisa entrar novamente para continuar.',
  FORBIDDEN: 'Voce nao tem permissao para executar esta acao.',
  NOT_FOUND: 'O recurso solicitado nao foi encontrado.',
  CONFLICT: 'Nao foi possivel concluir a operacao por conflito de dados.',
  VALIDATION_ERROR: 'Ha campos invalidos na requisicao.',
  SERVER_ERROR: 'A API encontrou um erro interno.',
  HTTP_ERROR: 'Nao foi possivel concluir a requisicao.',
  UNKNOWN_ERROR: 'Nao foi possivel concluir a requisicao.',
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof NormalizedApiError) {
    return error;
  }

  if (error instanceof HttpErrorResponse) {
    const apiError = extractApiError(error.error);

    if (apiError) {
      return new NormalizedApiError({
        status: error.status,
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
        response: { error: apiError },
      });
    }

    return buildFallbackApiError(error.status, error.message, error.error);
  }

  if (isApiErrorResponse(error)) {
    return new NormalizedApiError({
      status: 0,
      code: error.error.code,
      message: error.error.message,
      details: error.error.details,
      response: error,
    });
  }

  return buildFallbackApiError(0, '', error);
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const error = (value as ApiErrorResponse).error;

  return Boolean(
    error &&
      typeof error === 'object' &&
      typeof error.code === 'string' &&
      typeof error.message === 'string',
  );
}

function extractApiError(value: unknown): ApiError | null {
  if (isApiErrorResponse(value)) {
    return value.error;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<ApiError>;

  if (typeof candidate.code !== 'string' || typeof candidate.message !== 'string') {
    return null;
  }

  return {
    code: candidate.code,
    message: candidate.message,
    details: candidate.details ?? null,
  };
}

function buildFallbackApiError(status: number, fallbackMessage: string, details: unknown): NormalizedApiError {
  const code = resolveErrorCode(status);
  const message =
    code === 'NETWORK_ERROR'
      ? FALLBACK_ERROR_MESSAGES[code]
      : fallbackMessage.trim() || FALLBACK_ERROR_MESSAGES[code];
  const normalizedDetails = normalizeErrorDetails(details);

  return new NormalizedApiError({
    status,
    code,
    message,
    details: normalizedDetails,
  });
}

function resolveErrorCode(status: number): string {
  if (status === 0) {
    return 'NETWORK_ERROR';
  }

  if (status === 400) {
    return 'BAD_REQUEST';
  }

  if (status === 401) {
    return 'UNAUTHORIZED';
  }

  if (status === 403) {
    return 'FORBIDDEN';
  }

  if (status === 404) {
    return 'NOT_FOUND';
  }

  if (status === 409) {
    return 'CONFLICT';
  }

  if (status === 422) {
    return 'VALIDATION_ERROR';
  }

  if (status >= 500) {
    return 'SERVER_ERROR';
  }

  return 'HTTP_ERROR';
}

function normalizeErrorDetails(details: unknown): NormalizedApiErrorOptions['details'] {
  if (
    details === null ||
    typeof details === 'string' ||
    Array.isArray(details) ||
    typeof details === 'object'
  ) {
    return typeof details === 'object' && details !== null && !Array.isArray(details)
      ? (details as Record<string, unknown>)
      : details;
  }

  return null;
}
