// Shared utility functions
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function createApiResponse<T>(data: T): { data: T; timestamp: string } {
  return {
    data,
    timestamp: formatTimestamp(),
  };
}

export function createApiError(error: string): { error: string; timestamp: string } {
  return {
    error,
    timestamp: formatTimestamp(),
  };
}

