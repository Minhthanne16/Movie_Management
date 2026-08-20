export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (!error || typeof error !== "object") return defaultMessage;
  const err = error as Record<string, unknown>;
  if (!err.response) return "Cannot connect to server. Please check that the backend is running.";
  const response = err.response as Record<string, unknown>;
  if (response.data) {
    if (typeof response.data === "string") return response.data;
    const data = response.data as Record<string, unknown>;
    if (typeof data.message === "string") return data.message;
  }
  return defaultMessage;
}
