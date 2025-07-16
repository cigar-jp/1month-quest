'use client'

import ProtectedRoute from '@/components/auth/protected-route'
import Header from '@/components/layout/header'
import DailyCheckin from '@/components/checkin/daily-checkin'
import { useActiveQuest } from '@/hooks/useQuests'
import Link from 'next/link'

export default function CheckinPage() {
  const { quest, isLoading } = useActiveQuest()

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ホーム
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-900">日次チェックイン</span>
            </nav>
          </div>

          {quest ? (
            <DailyCheckin />
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mb-6">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  クエストが開始されていません
                </h2>
                <p className="text-gray-600 mb-6">
                  日次チェックインを使用するには、まず30日クエストを開始してください。
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  クエストを開始する
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}