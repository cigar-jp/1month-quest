'use client'

import { SWRConfig } from 'swr'
import { fetcher } from '@/lib/swr/fetcher'

interface SWRProviderProps {
  children: React.ReactNode
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
        onError: (error) => {
          console.error('SWR Error:', error)
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}