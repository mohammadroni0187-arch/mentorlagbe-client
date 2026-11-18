import { authClient } from "./auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  /** Object/array hole auto JSON.stringify hoy. string, FormData jemon ache temon jay. */
  body?: unknown;
  /** false dile Authorization header jabe na (public endpoint-er jonno). Default: true */
  auth?: boolean;
};

const getToken = async (): Promise<string> => {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new ApiError("Authentication required. Please login.", 401);
  }

  return data.token;
};

const serializeBody = (body: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string" || body instanceof FormData) return body;
  return JSON.stringify(body);
};

const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
  }

  if (auth) {
    finalHeaders.set("Authorization", `Bearer ${await getToken()}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers: finalHeaders,
      body: serializeBody(body),
    });
  } catch {
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : "API request failed";

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}