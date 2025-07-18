"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/swr/fetcher";

interface SWRProviderProps {
  children: React.ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: (error) => {
          // Don't retry on 4xx errors (client errors)
          return error.status >= 500;
        },
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          // Don't retry on 401 (unauthorized) errors
          if (error.status === 401) return;

          // Only retry up to 3 times
          if (retryCount >= 3) return;

          // Retry after 5 seconds
          setTimeout(() => revalidate({ retryCount }), 5000);
        },
        onError: (error) => {
          console.error("SWR Error:", error);
          // Don't show console errors for 404s when no active quest exists
          if (error.status !== 404) {
            console.error("SWR Error Details:", error.info);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
