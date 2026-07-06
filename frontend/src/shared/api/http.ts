import { env } from "@/config/env";
import type { ApiErrorEnvelope } from "@/shared/types/api";

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options: { status: number; code?: string; details?: unknown }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

type RequestJsonOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
  token?: string | null;
};

function parseResponseBody(rawBody: string) {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

function getErrorMessage(payload: unknown, status: number, statusText: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as ApiErrorEnvelope).error;
    if (error?.message) {
      return error.message;
    }
  }

  return statusText || `Request failed with status ${status}`;
}

export async function requestJson<TResponse>(path: string, options: RequestJsonOptions = {}) {
  const url = `${env.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
  });

  const rawBody = await response.text();
  const payload = parseResponseBody(rawBody);

  if (!response.ok) {
    if (payload && typeof payload === "object" && "error" in payload) {
      const error = (payload as ApiErrorEnvelope).error;
      throw new ApiRequestError(error.message, {
        status: response.status,
        code: error.code,
        details: error.details,
      });
    }

    throw new ApiRequestError(getErrorMessage(payload, response.status, response.statusText), {
      status: response.status,
      details: payload,
    });
  }

  return payload as TResponse;
}
