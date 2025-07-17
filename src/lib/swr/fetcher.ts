interface ErrorInfo {
  error?: string;
  message?: string;
}

interface FetchError extends Error {
  info: ErrorInfo;
  status: number;
}

export const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    let errorInfo: ErrorInfo = {};
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: response.statusText };
    }

    const error = new Error(
      `HTTP ${response.status}: ${errorInfo.error || errorInfo.message || "An error occurred while fetching the data."}`,
    ) as FetchError;
    // Attach extra info to the error object
    error.info = errorInfo;
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const mutationFetcher = async (
  url: string,
  { arg }: { arg: unknown },
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let errorInfo: ErrorInfo = {};
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: response.statusText };
    }

    const error = new Error(
      `HTTP ${response.status}: ${errorInfo.error || errorInfo.message || "An error occurred while mutating the data."}`,
    ) as FetchError;
    error.info = errorInfo;
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const updateFetcher = async (url: string, { arg }: { arg: unknown }) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let errorInfo: ErrorInfo = {};
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: response.statusText };
    }

    const error = new Error(
      `HTTP ${response.status}: ${errorInfo.error || errorInfo.message || "An error occurred while updating the data."}`,
    ) as FetchError;
    error.info = errorInfo;
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const deleteFetcher = async (url: string) => {
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    let errorInfo: ErrorInfo = {};
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: response.statusText };
    }

    const error = new Error(
      `HTTP ${response.status}: ${errorInfo.error || errorInfo.message || "An error occurred while deleting the data."}`,
    ) as FetchError;
    error.info = errorInfo;
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const patchFetcher = async (url: string, { arg }: { arg: unknown }) => {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
    credentials: "same-origin",
  });

  if (!response.ok) {
    let errorInfo: ErrorInfo = {};
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: response.statusText };
    }

    const error = new Error(
      `HTTP ${response.status}: ${errorInfo.error || errorInfo.message || "An error occurred while patching the data."}`,
    ) as FetchError;
    error.info = errorInfo;
    error.status = response.status;
    throw error;
  }

  return response.json();
};
